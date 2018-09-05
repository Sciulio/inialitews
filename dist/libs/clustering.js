"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
function isMasterProcess() {
    // configuration for Pm2 with default 'instance_var' config option
    if ("NODE_APP_INSTANCE" in process.env) {
        return process.env.NODE_APP_INSTANCE === 0;
    }
    // nodejs module parenting is not reliable
    return cluster_1.default.isMaster || processId() == 0 || !!module.parent && !module.parent.parent;
}
exports.isMasterProcess = isMasterProcess;
function processId() {
    // configuration for Pm2 with default 'instance_var' config option
    if ("NODE_APP_INSTANCE" in process.env) {
        return process.env.NODE_APP_INSTANCE;
    }
    return cluster_1.default.worker && cluster_1.default.worker.process.pid || 0;
}
exports.processId = processId;
//# sourceMappingURL=clustering.js.map