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
const koa_1 = __importDefault(require("koa"));
const koa_mount_1 = __importDefault(require("koa-mount"));
const cluster_1 = __importDefault(require("cluster"));
const logger_1 = require("./libs/logger");
const config_1 = require("./libs/config");
const exporters_1 = require("./libs/exporters");
const clustering_1 = require("./libs/clustering");
const clusterbus_1 = require("./libs/clusterbus");
const config = config_1.loadConfiguration();
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        executeAnyProcess();
        if (!clustering_1.isProduction()) {
            if (clustering_1.isMasterProcess()) {
                yield executeMasterProcess();
            }
            else {
                yield executeChildProcess();
            }
        }
        else {
            executeChildProcess();
        }
    });
})();
function executeAnyProcess() {
    return __awaiter(this, void 0, void 0, function* () {
        //TODO: init from logger
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
function executeMasterProcess() {
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
        // execute services
        //TODO
        yield exporters_1.loadExporters("./services/*/index.js", __dirname, " - LOAD: Services")
            .mapAsync((serviceExport) => __awaiter(this, void 0, void 0, function* () {
            yield serviceExport.init();
        }));
        // Start child threads
        const cpuCount = require('os').cpus().length;
        for (var i = 0; i < cpuCount; i++) {
            const worker = cluster_1.default.fork();
            worker.on("disconnect", () => logger_1.logger.info(`Worker '${worker.id}' disconnected!`));
            worker.on("exit", (code, signal) => logger_1.logger.info(`Worker '${worker.id}' exiting with code '${code}' and signal '${signal}'!`));
            logger_1.logger.info(`New Worker '${worker.id}' forked!`);
        }
    });
}
function executeChildProcess() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = new koa_1.default();
        yield exporters_1.loadExporters("./services/*/index.js", __dirname, " - LOAD: Services")
            .mapAsync((serviceExport) => __awaiter(this, void 0, void 0, function* () {
            yield serviceExport.init();
        }));
        yield exporters_1.loadExporters("./config/*.js", __dirname, " - LOAD: App Configurations")
            .mapAsync((configExport) => __awaiter(this, void 0, void 0, function* () {
            yield configExport.init(app);
        }));
        yield exporters_1.loadExporters("./routes/*/index.js", __dirname, " - MOUNT: AppedRoutes")
            .mapAsync((appExport) => __awaiter(this, void 0, void 0, function* () {
            app.use(koa_mount_1.default(appExport.route, appExport.app));
            yield appExport.init(app);
        }));
        // server config/handling
        const port = process.env.PORT || config.server.port || 3000;
        const server = app
            .listen(port, () => {
            logger_1.logger.info(`Server on process [${clustering_1.workerId()}] running on port: '${port}'`);
        });
        // app.on("error", () => {});
        server.on("error", (err) => {
            logger_1.logger.error("KOA ERROR HANDLER", err);
        });
        process.on("disconnect", () => {
            logger_1.logger.error(` - disconnetting child process: [${clustering_1.workerId()}]`);
            server.close(function () {
                //TODO: dispose loaded entities
                //TODO: on app terminate execute dynamiclyloadedmodules dispose()
                process.exit(0);
            });
        });
    });
}
//# sourceMappingURL=index.js.map