"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dynamolo_1 = require("dynamolo");
const logger_1 = require("./logger");
const dynamoloCommonConfig = {
    exportDefault: true,
    logInfo: logger_1.logger.info,
    logError: logger_1.logger.error
    //logInfo: (...args: any[]) => console.log("\x1b[35m", "INFO", ...args, "\x1b[0m"),
    //logError: (...args: any[]) => console.log("\x1b[31m", "ERROR", ...args, "\x1b[0m")
};
function loadExporters(_path, root, infoMessage) {
    logger_1.logger.info(infoMessage);
    //TODO: check order collisions
    //TODO: exceptions handling? stop app?
    return dynamolo_1.load(path_1.default.join(root, _path), dynamoloCommonConfig)
        .sort((a, b) => a.order > b.order ? 1 : -1);
}
exports.loadExporters = loadExporters;
;
//# sourceMappingURL=exporters.js.map