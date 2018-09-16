"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importStar(require("cluster"));
function isPm2Managed() {
    return "NODE_APP_INSTANCE" in process.env;
}
exports.isPm2Managed = isPm2Managed;
function isMasterProcess() {
    // configuration for Pm2 with default 'instance_var' config option
    if ("NODE_APP_INSTANCE" in process.env) {
        return process.env.NODE_APP_INSTANCE === 0;
    }
    // nodejs module parenting is not reliable
    return cluster_1.default.isMaster; // || workerId() == 0; // || !!module.parent && !module.parent.parent;
}
exports.isMasterProcess = isMasterProcess;
function workerId() {
    // configuration for Pm2 with default 'instance_var' config option
    if ("NODE_APP_INSTANCE" in process.env) {
        return process.env.NODE_APP_INSTANCE;
    }
    return cluster_1.default.worker && cluster_1.default.worker.process.pid || 0;
}
exports.workerId = workerId;
function processKey() {
    if (cluster_1.default.worker) {
        return cluster_1.worker.id + "_" + cluster_1.default.worker.process.pid;
    }
    return 0 + "_" + process.pid;
}
exports.processKey = processKey;
function isProduction() {
    return process.env.NODE_ENV == 'production';
}
exports.isProduction = isProduction;
//# sourceMappingURL=env.js.map