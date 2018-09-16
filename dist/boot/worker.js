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
const koa_1 = __importDefault(require("koa"));
const env_1 = require("../libs/env");
const config_1 = require("../libs/config");
const logger_1 = require("../libs/logger");
const boot_1 = require("../libs/boot");
const exporters_1 = require("../libs/exporters");
const config = config_1.loadConfiguration();
exports.default = {
    init: () => __awaiter(this, void 0, void 0, function* () {
        // init services
        const servicesExported = yield exporters_1.loadExporters("./services/*/index.js", " - LOAD: Services")
            .mapAsync((serviceExport) => __awaiter(this, void 0, void 0, function* () {
            yield serviceExport.init();
            return serviceExport;
        }));
        // server config/handling
        const port = process.env.PORT || config.server.port || 3000;
        const app = new koa_1.default();
        const appExported = yield exporters_1.loadExporters("./mwares/*.js", " - LOAD: App Configurations")
            .mapAsync((configExport) => __awaiter(this, void 0, void 0, function* () {
            yield configExport.init(app);
            return configExport;
        }));
        const server = app
            .listen(port, () => {
            logger_1.logger.info(`Server on process [${env_1.workerId()}] running on port: '${port}'`);
        })
            .on("error", (err) => {
            logger_1.logger.error("KOA ERROR HANDLER", err);
        });
        // app.on("error", () => {});
        boot_1.AppLifecycleEmitter.instance.onClosing = () => __awaiter(this, void 0, void 0, function* () {
            server.close(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    exporters_1.disposeExporters(servicesExported, "Disposing services!");
                    exporters_1.disposeExporters(appExported, "Disposing app and routes!");
                });
            });
        });
    })
};
//# sourceMappingURL=worker.js.map