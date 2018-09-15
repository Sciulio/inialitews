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
require("async-extensions");
const cluster_1 = __importDefault(require("cluster"));
const koa_1 = __importDefault(require("koa"));
const logger_1 = require("./libs/logger");
const config_1 = require("./libs/config");
const exporters_1 = require("./libs/exporters");
const workers_1 = require("./libs/workers");
const clusterbus_1 = require("./libs/clusterbus");
const config = config_1.loadConfiguration();
//setTimeout(init,5000);
init();
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        configLibs();
        if (workers_1.isProduction()) {
            if (workers_1.isMasterProcess()) {
                yield processErrorSignaling();
                yield initServices();
                if (!workers_1.isPm2Managed()) {
                    forkWorkers();
                }
            }
            else {
                yield initServices();
                yield initMiddlewares();
            }
        }
        else {
            yield processErrorSignaling();
            yield initServices();
            yield initMiddlewares();
        }
    });
}
;
function forkWorkers() {
    // Start child threads
    const cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i++) {
        const worker = cluster_1.default.fork();
        worker.on("disconnect", () => logger_1.logger.info(`Worker '${worker.id}' disconnected!`));
        worker.on("exit", (code, signal) => logger_1.logger.info(`Worker '${worker.id}' exiting with code '${code}' and signal '${signal}'!`));
        logger_1.logger.info(`New Worker '${worker.id}' forked!`);
    }
}
function processErrorSignaling() {
    return __awaiter(this, void 0, void 0, function* () {
        // process config/handling
        process
            .on('uncaughtException', (err) => {
            logger_1.logger.error("PROCESS ERROR HANDLER", err);
        })
            //.on('unhandledRejection', (err) => { ... })
            .on("beforeExit", onExit)
            .on("SIGINT", onExit)
            .on("SIGTERM", onExit);
        let isClosing = false;
        function onExit() {
            if (isClosing) {
                return;
            }
            isClosing = true;
        }
        ;
    });
}
function configLibs() {
    return __awaiter(this, void 0, void 0, function* () {
        //TODO: init from logger
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
    });
}
function initServices() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exporters_1.loadExporters("./services/*/index.js", " - LOAD: Services")
            .mapAsync((serviceExport) => __awaiter(this, void 0, void 0, function* () {
            yield serviceExport.init();
        }));
    });
}
function initMiddlewares() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = new koa_1.default();
        yield exporters_1.loadExporters("./mwares/*.js", " - LOAD: App Configurations")
            .mapAsync((configExport) => __awaiter(this, void 0, void 0, function* () {
            yield configExport.init(app);
        }));
        // server config/handling
        const port = process.env.PORT || config.server.port || 3000;
        const server = app
            .listen(port, () => {
            logger_1.logger.info(`Server on process [${workers_1.workerId()}] running on port: '${port}'`);
        })
            .on("error", (err) => {
            logger_1.logger.error("KOA ERROR HANDLER", err);
        });
        // app.on("error", () => {});
        process.on("disconnect", () => {
            logger_1.logger.error(` - disconnetting child process: [${workers_1.workerId()}]`);
            server.close(function () {
                //TODO: dispose loaded entities
                //TODO: on app terminate execute dynamiclyloadedmodules dispose()
                process.exit(0);
            });
        });
    });
}
//# sourceMappingURL=index.js.map