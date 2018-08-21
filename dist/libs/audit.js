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
const path_1 = __importDefault(require("path"));
require("async-extensions");
const nedb_1 = __importDefault(require("nedb"));
const config_1 = require("./config");
const config = config_1.loadConfiguration();
//TODO: set a lib:package for this AAAAAAAA
const dbs = {};
function initDb() {
    return __awaiter(this, void 0, void 0, function* () {
        yield Object.keys(config.tenants)
            .forEachAsync((tenantKey) => __awaiter(this, void 0, void 0, function* () {
            const tenant = config.tenants[tenantKey];
            const db = new nedb_1.default({
                filename: path_1.default.join(config.target.root, tenant.name + ".db")
            });
            yield new Promise((res, rej) => {
                db.loadDatabase((err) => {
                    if (err) {
                        rej(err);
                    }
                    else {
                        console.log(" - initted db for tenant:", tenant.name);
                        dbs[tenant.name] = {
                            db,
                            on: Date.now()
                        };
                        res();
                    }
                });
            });
        }));
    });
}
exports.initDb = initDb;
function fetchFileAudit(tenantName, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = dbs[tenantName].db;
        return new Promise((res, rej) => {
            db.findOne({
                url
            }, function (err, doc) {
                // doc is the document Mars
                // If no document is found, doc is null
                err ? rej(err) : res(doc);
            });
        });
    });
}
exports.fetchFileAudit = fetchFileAudit;
//# sourceMappingURL=audit.js.map