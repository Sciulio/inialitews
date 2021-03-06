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
const logger_1 = require("../../libs/logger");
const config_1 = require("../../libs/config");
const env_1 = require("../../libs/env");
const clusterbus_1 = require("../../libs/clusterbus");
const nedb_1 = __importDefault(require("nedb"));
const config = config_1.loadConfiguration();
const channelLabel = "api_services_sendmail";
let _initDb;
let _insert;
if (env_1.isMasterProcess()) {
    let db;
    _initDb = function (apiKey) {
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
            clusterbus_1.subscribeReqResChannel(channelLabel, (data) => __awaiter(this, void 0, void 0, function* () {
                return yield _insert(data);
            }));
        });
    };
    _insert = function (item) {
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
    };
}
else {
    _initDb = function (apiKey) {
        return __awaiter(this, void 0, void 0, function* () { });
    };
    _insert = function (item) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clusterbus_1.requestMaster(channelLabel, item);
        });
    };
}
exports.initDb = _initDb;
exports.insert = _insert;
//# sourceMappingURL=storage.js.map