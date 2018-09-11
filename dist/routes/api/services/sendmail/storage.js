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
const logger_1 = require("../../../../libs/logger");
const nedb_1 = __importDefault(require("nedb"));
//const Datastore = require('nedb-multi')(8085);
const config_1 = require("../../../../libs/config");
const config = config_1.loadConfiguration();
//let db: Datastore;
let db;
function initDb(apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        db = new nedb_1.default({
            filename: path_1.default.join(process.cwd(), config.services.db.path, apiKey + ".nedb")
        });
        yield new Promise((res, rej) => {
            db.loadDatabase((err) => {
                if (err) {
                    rej(err);
                }
                else {
                    logger_1.logger.info(` - initted db for api: ${apiKey}`);
                    res();
                }
            });
        });
    });
}
exports.initDb = initDb;
function insert(item) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            db.insert(item, (err, doc) => {
                if (err) {
                    rej(err);
                }
                res(doc);
            });
        });
    });
}
exports.insert = insert;
//# sourceMappingURL=storage.js.map