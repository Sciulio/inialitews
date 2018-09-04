"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dynamolo_1 = require("dynamolo");
const dynamoloCommonConfig = {
    exportDefault: true,
    logInfo: (...args) => console.log("\x1b[35m", "INFO", ...args, "\x1b[0m"),
    logError: (...args) => console.log("\x1b[31m", "ERROR", ...args, "\x1b[0m")
};
function loadExporters(_path, root, infoMessage) {
    console.log(infoMessage);
    //TODO: check order collisions
    //TODO: exceptions handling? stop app?
    return dynamolo_1.load(path_1.default.join(root, _path), dynamoloCommonConfig)
        .sort((a, b) => a.order > b.order ? 1 : -1);
}
exports.loadExporters = loadExporters;
;
//# sourceMappingURL=exporters.js.map