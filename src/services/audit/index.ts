import fs from 'fs';
import path from 'path';
import readline from 'readline';

import 'async-extensions';

import { loadConfiguration } from '../../libs/config';
import { tServiceExporter } from '../../libs/exporters';
import { docFileAudit } from './types';


const config = loadConfiguration();

type tDataSet = {
  items: any[]
};

const dbs: {[key: string]: {
  db: tDataSet,
  on: number
}} = {};

export default {
  order: 100,
  init: async function() {
    await Object.keys(config.tenants)
    .forEachAsync(async tenantKey => {
      const tenant = config.tenants[tenantKey];

      dbs[tenant.name] = {
        db: await loadTenantAudit(tenant.name),
        on: Date.now()
      };
    });
  },
  dispose: async function() {
    Object.keys(dbs)
    .forEach(dbKey => {
      const db = dbs[dbKey];
      delete dbs[dbKey];

      db.db.items.length = 0;
      delete db.db.items;
      delete db.db;
    });
  }
} as tServiceExporter;

async function loadTenantAudit(tenantName: string): Promise<tDataSet> {
  const dbFileName = path.join(config.target.root, tenantName, "audit.nedb");
  const dataSet: tDataSet = {
    items: []
  };

  return new Promise<tDataSet>((res, rej) => {
    //TODO: manage errors

    const lineReader = readline
    .createInterface({
      input: fs.createReadStream(dbFileName)
    });
    
    lineReader.on('line', function (line) {
      const item = JSON.parse(line);
      dataSet.items.push(item);
    });
    lineReader.on('close', function() {
      lineReader.close();

      res(dataSet);
    });
  });
}

export async function fetchFileAudit(tenantName: string, url: string) {
  /*if (!(tenantName in dbs)) {
    TODO: sync
    dbs[tenantName] = {
      db: await loadTenantAudit(tenantName),
      on: Date.now()
    };
  }*/

  const db = dbs[tenantName].db;
  return db.items.filter((item: docFileAudit) => item.url == url)[0];
}