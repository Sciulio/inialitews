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
const config = config_1.loadConfiguration();
const dbs = {};
exports.default = {
    order: 100,
    init: function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield Object.keys(config.tenants)
                .forEachAsync((tenantKey) => __awaiter(this, void 0, void 0, function* () {
                const tenant = config.tenants[tenantKey];
                dbs[tenant.name] = {
                    db: yield loadTenantAudit(tenant.name),
                    on: Date.now()
                };
            }));
        });
    },
    dispose: function () {
        return __awaiter(this, void 0, void 0, function* () {
            Object.keys(dbs)
                .forEach(dbKey => {
                const db = dbs[dbKey];
                delete dbs[dbKey];
                db.db.items.length = 0;
                delete db.db.items;
                delete db.db;
            });
        });
    }
};
function loadTenantAudit(tenantName) {
    return __awaiter(this, void 0, void 0, function* () {
        const dbFileName = path_1.default.join(config.target.root, tenantName, "audit.nedb");
        const dataSet = {
            items: []
        };
        return new Promise((res, rej) => {
            //TODO: manage errors
            const lineReader = readline_1.default
                .createInterface({
                input: fs_1.default.createReadStream(dbFileName)
            });
            lineReader.on('line', function (line) {
                const item = JSON.parse(line);
                dataSet.items.push(item);
            });
            lineReader.on('close', function () {
                lineReader.close();
                res(dataSet);
            });
        });
    });
}
function fetchFileAudit(tenantName, url) {
    return __awaiter(this, void 0, void 0, function* () {
        /*if (!(tenantName in dbs)) {
          TODO: sync
          dbs[tenantName] = {
            db: await loadTenantAudit(tenantName),
            on: Date.now()
          };
        }*/
        const db = dbs[tenantName].db;
        return db.items.filter((item) => item.url == url)[0];
    });
}
exports.fetchFileAudit = fetchFileAudit;
//# sourceMappingURL=index.js.map