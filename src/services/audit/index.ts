import fs from 'fs';
import path from 'path';
import readline from 'readline';

import 'async-extensions';

import { loadConfiguration } from '../../libs/config';
import { tServiceExporter } from '../../libs/exporters';
import { logger } from '../../libs/logger';
import { isMasterProcess } from '../../libs/workers';
import { subscribeReqResChannel, requestMaster } from '../../libs/clusterbus';

const config = loadConfiguration();



const rgxpStringValueEnd = /\s*(?<!\\)"(.*?)(?<!\\)"\s*[,\}]/;
const rgxpNonStringValueEnd = /\s*(.*?)\s*[,\}]/;

function jsonTextScraper_regxpCreate(key: string) {
  return new RegExp('(?<!\\\\)"' + key + '(?<!\\\\)"\s*:');
}
function jsonTextScraper(line: string, rgxpKey: RegExp) {
  const matchKey = line.match(rgxpKey);

  if (matchKey) {
    const linePart = line.substring((matchKey.index || 0) + matchKey[0].length);
    const isStringValue = linePart[0] == '"';
    const valueMatch = linePart.match(isStringValue ? rgxpStringValueEnd : rgxpNonStringValueEnd);

    if (valueMatch) {
      const result = valueMatch[1];

      if (isStringValue) {
        return result;
      }
      if (result === "true" || result === "false") {
        return result;
      }
      return Number(result);
    }
  }
  return null;
}


type tDataItemSchema = {
  label?: string;
  key: string;
  key_regexp?: RegExp; //TODO
  validityKey: string;
  validityKey_regexp?: RegExp; //TODO
  validityComparer: (value: number, valueAgainst: number) => boolean;
  parser: <T>(text: string) => T;
  binder: <T>(doc: any) => T;
};
type tDataSetSchema = {
  selector: string;
  diSchemas: {[schema: string]: tDataItemSchema};
};

type tDataSet = {
  items: any[];
  docs: {[columnKey: string]: {[docKey: string]: any}};

  dsSchemas: tDataSetSchema;
};

const dataSet: tDataSet = {
  items: [],
  docs: {},
  dsSchemas: {
    selector: "_type",
    diSchemas: {
      "fileinfo": {
        key: "url",
        validityKey: "_on",
        validityComparer: (value: number, valueAgainst: number) => {
          return value > valueAgainst;
        },
        parser: JSON.parse,
        binder: <tFileAudit>(doc: tFileAudit) => doc
      },
      "buildinfo": {
        key: "_id",
        validityKey: "_on",
        validityComparer: (value: number, valueAgainst: number) => {
          return value > valueAgainst;
        },
        parser: JSON.parse,
        binder: <tBuildAudit>(doc: tBuildAudit) => doc
      }
    }
  }
};

function _getValueByPath(path: string, obj: any) {
  return obj[path];
}

async function loadTenantAudit(tenantName: string): Promise<tDataSet> {
  const dbFileName = path.join(config.target.root, tenantName, "audit.nedb");

  //add shema and parse it
  const rgxpDsSchemasSelector = jsonTextScraper_regxpCreate(dataSet.dsSchemas.selector);
  Object.keys(dataSet.dsSchemas.diSchemas)
  .map(key => dataSet.dsSchemas.diSchemas[key])
  .forEach(diSchema => {
    diSchema.key_regexp = jsonTextScraper_regxpCreate(diSchema.key);
    diSchema.validityKey_regexp = jsonTextScraper_regxpCreate(diSchema.validityKey);
  });

  return new Promise<tDataSet>((res, rej) => {
    //TODO: manage errors
    //TODO: check file existance/integrity

    const lineReader = readline
    .createInterface({
      input: fs.createReadStream(dbFileName)
    });
    
    lineReader.on('line', function (line) {
      const dsSchemaKey = jsonTextScraper(line, rgxpDsSchemasSelector);
      if (dsSchemaKey == null) {
        logger.warn("Audit::index - init db: dsSchemaKey not found");
        return;
      }

      const diSchema = dataSet.dsSchemas.diSchemas[dsSchemaKey];
      const diSchemaLabel = diSchema.label || dsSchemaKey;
      const idValue = jsonTextScraper(line, diSchema.key_regexp as RegExp);
      if (idValue == null) {
        logger.warn("Audit::index - init db: idValue not found");
        return;
      }

      const docsTable = dataSet.docs[diSchemaLabel] || (dataSet.docs[diSchemaLabel] = {});
      let docItem: any = null;
      if (idValue in docsTable) {
        docItem = docsTable[idValue];
        const val = jsonTextScraper(line, diSchema.validityKey_regexp as RegExp) as number;

        if (val != null && !diSchema.validityComparer(val, docItem[diSchema.validityKey] as  number)) {
          return;
        }
      }

      const item = diSchema.parser(line);

      if (docItem) {
        const idx = dataSet.items.indexOf(docItem);
        dataSet.items.splice(idx, 1);
      }

      docsTable[idValue] = item;
      dataSet.items.push(item);
    });
    lineReader.on('close', function() {
      lineReader.close();

      res(dataSet);
    });
  });
}

type tQueueArgs = {
  tenantName: string;
  url: string;
};
const channelLabel = "audit_fetchdata";
export let fetchFileAudit: <T>(tenantName: string, url: string) => Promise<T>;

if (isMasterProcess()) {
  subscribeReqResChannel<tQueueArgs>(channelLabel, async data => await fetchFileAudit(data.tenantName, data.url));

  fetchFileAudit = function<T>(tenantName: string, url: string): Promise<T> {
    /*if (!(tenantName in dbs)) {
      TODO: sync
      dbs[tenantName] = {
        db: await loadTenantAudit(tenantName),
        on: Date.now()
      };
    }*/

    //TODO: add "fileinfo"
    const typeSelector = "fileinfo";

    const db = dbs[tenantName].db;
    return Promise.resolve(db.dsSchemas.diSchemas[typeSelector].binder(db.docs[typeSelector][url]) as T);
    //return db.items.filter((item: docFileAudit) => item.url == url)[0];
  }
} else {
  fetchFileAudit = async function<T>(tenantName: string, url: string): Promise<T> {
    return await (requestMaster<T>(channelLabel, {
      tenantName,
      url
    } as tQueueArgs) as Promise<T>);
  }
}



const dbs: {[key: string]: {
  db: tDataSet,
  on: number
}} = {};

export default {
  order: 100,
  init: async function() {
    if (isMasterProcess()) {
      await Object.keys(config.tenants)
      .forEachAsync(async tenantKey => {
        const tenant = config.tenants[tenantKey];

        dbs[tenant.name] = {
          db: await loadTenantAudit(tenant.name),
          on: Date.now()
        };
      });
    }
  },
  dispose: async function() {
    if (isMasterProcess()) {
      Object.keys(dbs)
      .forEach(dbKey => {
        const db = dbs[dbKey];
        delete dbs[dbKey];

        db.db.items.length = 0;
        delete db.db.items;
        delete db.db;
      });
    }
  }
} as tServiceExporter;