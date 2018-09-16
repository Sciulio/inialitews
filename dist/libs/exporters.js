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
const dynamolo_1 = require("dynamolo");
const logger_1 = require("./logger");
const dynamoloCommonConfig = {
    exportDefault: true,
    //logInfo: (...args: any[]) => console.log("\x1b[35m", "INFO", ...args, "\x1b[0m"),
    //logError: (...args: any[]) => console.log("\x1b[31m", "ERROR", ...args, "\x1b[0m")
    logInfo: (...args) => logger_1.logger.info(args.join("\t")),
    logError: (...args) => logger_1.logger.error(args.join("\t"))
};
let appRoot = "";
function config(_appRoot) {
    appRoot = _appRoot;
}
exports.config = config;
function loadExporter(...args) {
    const _path = args[0];
    const infoMessage = args[1];
    const rootPath = args.length == 3 ? args[2] : appRoot;
    const absPath = path_1.default.join(rootPath, _path);
    logger_1.logger.info(infoMessage);
    //TODO: check order collisions
    //TODO: exceptions handling? stop app?
    return dynamolo_1.load(absPath, dynamoloCommonConfig)[0];
}
exports.loadExporter = loadExporter;
;
function loadExporters(...args) {
    const _path = args[0];
    const infoMessage = args[1];
    const rootPath = args.length == 3 ? args[2] : appRoot;
    const absPath = path_1.default.join(rootPath, _path);
    logger_1.logger.info(infoMessage);
    //TODO: check order collisions
    //TODO: exceptions handling? stop app?
    return dynamolo_1.load(absPath, dynamoloCommonConfig)
        .sort((a, b) => a.order > b.order ? 1 : -1);
}
exports.loadExporters = loadExporters;
;
function disposeExporters(list, infoMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info(infoMessage);
        yield list
            .forEachAsync((moduleExport) => __awaiter(this, void 0, void 0, function* () {
            yield moduleExport.dispose();
        }));
    });
}
exports.disposeExporters = disposeExporters;
//# sourceMappingURL=exporters.js.map