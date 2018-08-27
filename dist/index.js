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
require("async-extensions");
const dynamolo_1 = require("dynamolo");
const koa_1 = __importDefault(require("koa"));
const koa_mount_1 = __importDefault(require("koa-mount"));
const config_1 = require("./libs/config");
const config = config_1.loadConfiguration();
const dynamoloCommonConfig = {
    exportDefault: true,
    logInfo: (...args) => console.log("\x1b[35m", "INFO", ...args, "\x1b[0m"),
    logError: (...args) => console.log("\x1b[31m", "ERROR", ...args, "\x1b[0m")
};
function loadExporters(_path) {
    return dynamolo_1.load(path_1.default.join(__dirname, _path), dynamoloCommonConfig)
        .sort((a, b) => a.order > b.order ? 1 : -1);
}
;
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const app = new koa_1.default();
        console.log(" - LOAD: App Configurations");
        yield loadExporters("./config/*.js")
            .mapAsync((configExport) => __awaiter(this, void 0, void 0, function* () {
            yield configExport.init(app);
        }));
        console.log(" - LOAD: Services");
        yield loadExporters("./services/*.js")
            .mapAsync((serviceExport) => __awaiter(this, void 0, void 0, function* () {
            yield serviceExport.init(app);
        }));
        console.log(" - MOUNT: AppedRoutes");
        yield loadExporters("./routes/*/index.js")
            .mapAsync((appExport) => __awaiter(this, void 0, void 0, function* () {
            app.use(koa_mount_1.default(appExport.route, appExport.app));
            yield appExport.init(app);
        }));
        if (!module.parent) {
            const server = app
                .listen(config.server.port, () => {
                console.log('Server running on port:', config.server.port);
            });
        }
    });
})();
//# sourceMappingURL=index.js.map