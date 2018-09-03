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
const config_1 = require("./libs/config");
const types_1 = require("./libs/types");
const config = config_1.loadConfiguration();
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const app = new koa_1.default();
        yield types_1.loadExporters("./config/*.js", __dirname, " - LOAD: App Configurations")
            .mapAsync((configExport) => __awaiter(this, void 0, void 0, function* () {
            yield configExport.init(app);
        }));
        yield types_1.loadExporters("./services/*.js", __dirname, " - LOAD: Services")
            .mapAsync((serviceExport) => __awaiter(this, void 0, void 0, function* () {
            yield serviceExport.init(app);
        }));
        yield types_1.loadExporters("./routes/*/index.js", __dirname, " - MOUNT: AppedRoutes")
            .mapAsync((appExport) => __awaiter(this, void 0, void 0, function* () {
            app.use(koa_mount_1.default(appExport.route, appExport.app));
            yield appExport.init(app);
        }));
        //TODO: on app terminate execute dynamiclyloadedmodules dispose()
        if (!module.parent) {
            const server = app
                .listen(config.server.port, () => {
                console.log('Server running on port:', config.server.port);
            });
            server.on("error", (err) => {
                console.error("KOA ERROR HANDLER", err);
            });
            process.on('uncaughtException', (err) => {
                console.error("ODEJS EH", err);
            });
            process.on("beforeExit", onExit);
            process.on("SIGINT", onExit);
            process.on("SIGTERM", onExit);
            let isClosing = false;
            function onExit() {
                if (isClosing) {
                    return;
                }
                isClosing = true;
                server.close(function () {
                    //TODO: dispose loaded entities
                    process.exit(0);
                });
            }
            ;
        }
        else {
            process.on("disconnect", () => { });
        }
    });
})();
//# sourceMappingURL=index.js.map