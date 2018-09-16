"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("async-extensions");
const env_1 = require("./libs/env");
const logger_1 = require("./libs/logger");
const exporters_1 = require("./libs/exporters");
const clusterbus_1 = require("./libs/clusterbus");
const boot_1 = require("./libs/boot");
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        // init loadexports
        exporters_1.config(__dirname);
        // init ClusterBus
        clusterbus_1.config({
            requestTimeout: 10000,
            logDebug: logger_1.logger.debug,
            logInfo: logger_1.logger.info,
            logWarning: logger_1.logger.warning,
            logError: logger_1.logger.error
        });
        yield boot_1.AppLifecycleEmitter.instance.init({
            moduleRoot: __dirname,
            processRoot: process.cwd()
        });
        (yield exporters_1.loadExporter(env_1.isMasterProcess() ? "./boot/master.js" : "./boot/worker.js", "Bootstrapping module!"))
            .init();
    });
}
exports.init = init;
;
//# sourceMappingURL=index.js.map