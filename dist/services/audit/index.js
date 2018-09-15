"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
require("async-extensions");
const config_1 = require("../../libs/config");
const logger_1 = require("../../libs/logger");
const workers_1 = require("../../libs/workers");
const clusterbus_1 = require("../../libs/clusterbus");
const config = config_1.loadConfiguration();
const rgxpStringValueEnd = /\s*(?<!\\)"(.*?)(?<!\\)"\s*[,\}]/;
const rgxpNonStringValueEnd = /\s*(.*?)\s*[,\}]/;
function jsonTextScraper_regxpCreate(key) {
    return new RegExp('(?<!\\\\)"' + key + '(?<!\\\\)"\s*:');
}
function jsonTextScraper(line, rgxpKey) {
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
const dataSet = {
    items: [],
    docs: {},
    dsSchemas: {
        selector: "_type",
        diSchemas: {
            "fileinfo": {
                key: "url",
                validityKey: "_on",
                validityComparer: (value, valueAgainst) => {
                    return value > valueAgainst;
                },
                parser: JSON.parse,
                binder: (doc) => doc
            },
            "buildinfo": {
                key: "_id",
                validityKey: "_on",
                validityComparer: (value, valueAgainst) => {
                    return value > valueAgainst;
                },
                parser: JSON.parse,
                binder: (doc) => doc
            }
        }
    }
};
function _getValueByPath(path, obj) {
    return obj[path];
}
function loadTenantAudit(tenantName) {
    return __awaiter(this, void 0, void 0, function* () {
        const dbFileName = path_1.default.join(config.target.root, tenantName, "audit.nedb");
        //add shema and parse it
        const rgxpDsSchemasSelector = jsonTextScraper_regxpCreate(dataSet.dsSchemas.selector);
        Object.keys(dataSet.dsSchemas.diSchemas)
            .map(key => dataSet.dsSchemas.diSchemas[key])
            .forEach(diSchema => {
            diSchema.key_regexp = jsonTextScraper_regxpCreate(diSchema.key);
            diSchema.validityKey_regexp = jsonTextScraper_regxpCreate(diSchema.validityKey);
        });
        return new Promise((res, rej) => {
            //TODO: manage errors
            //TODO: check file existance/integrity
            const lineReader = readline_1.default
                .createInterface({
                input: fs_1.default.createReadStream(dbFileName)
            });
            lineReader.on('line', function (line) {
                const dsSchemaKey = jsonTextScraper(line, rgxpDsSchemasSelector);
                if (dsSchemaKey == null) {
                    logger_1.logger.warn("Audit::index - init db: dsSchemaKey not found");
                    return;
                }
                const diSchema = dataSet.dsSchemas.diSchemas[dsSchemaKey];
                const diSchemaLabel = diSchema.label || dsSchemaKey;
                const idValue = jsonTextScraper(line, diSchema.key_regexp);
                if (idValue == null) {
                    logger_1.logger.warn("Audit::index - init db: idValue not found");
                    return;
                }
                const docsTable = dataSet.docs[diSchemaLabel] || (dataSet.docs[diSchemaLabel] = {});
                let docItem = null;
                if (idValue in docsTable) {
                    docItem = docsTable[idValue];
                    const val = jsonTextScraper(line, diSchema.validityKey_regexp);
                    if (val != null && !diSchema.validityComparer(val, docItem[diSchema.validityKey])) {
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
            lineReader.on('close', function () {
                lineReader.close();
                res(dataSet);
            });
        });
    });
}
const channelLabel = "audit_fetchdata";
if (workers_1.isMasterProcess()) {
    clusterbus_1.subscribeReqResChannel(channelLabel, (data) => __awaiter(this, void 0, void 0, function* () { return yield exports.fetchFileAudit(data.tenantName, data.url); }));
    exports.fetchFileAudit = function (tenantName, url) {
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
        return Promise.resolve(db.dsSchemas.diSchemas[typeSelector].binder(db.docs[typeSelector][url]));
        //return db.items.filter((item: docFileAudit) => item.url == url)[0];
    };
}
else {
    exports.fetchFileAudit = function (tenantName, url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clusterbus_1.requestMaster(channelLabel, {
                tenantName,
                url
            });
        });
    };
}
const dbs = {};
exports.default = {
    order: 100,
    init: function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (workers_1.isMasterProcess()) {
                yield Object.keys(config.tenants)
                    .forEachAsync((tenantKey) => __awaiter(this, void 0, void 0, function* () {
                    const tenant = config.tenants[tenantKey];
                    dbs[tenant.name] = {
                        db: yield loadTenantAudit(tenant.name),
                        on: Date.now()
                    };
                }));
            }
        });
    },
    dispose: function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (workers_1.isMasterProcess()) {
                Object.keys(dbs)
                    .forEach(dbKey => {
                    const db = dbs[dbKey];
                    delete dbs[dbKey];
                    db.db.items.length = 0;
                    delete db.db.items;
                    delete db.db;
                });
            }
        });
    }
};
//# sourceMappingURL=index.js.map