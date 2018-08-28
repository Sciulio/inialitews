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
const types_1 = require("../../libs/types");
const app = new koa_1.default();
exports.default = {
    order: 1000,
    app,
    route: "/_api",
    init: function (parentApp) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(` -  - INIT: App[${"/_api"}]`);
            console.log(" -  - LOAD: AppConfigurations");
            yield types_1.loadExporters("./config/*.js", __dirname)
                .mapAsync((configExport) => __awaiter(this, void 0, void 0, function* () {
                yield configExport.init(app);
            }));
            console.log(" -  - LOAD: Routes");
            yield types_1.loadExporters("./services/*/index.js", __dirname)
                .forEachAsync((routeExport) => __awaiter(this, void 0, void 0, function* () {
                app
                    .use(routeExport.router.routes())
                    .use(routeExport.router.allowedMethods());
                yield routeExport.init();
            }));
        });
    },
    dispose: function () {
        return __awaiter(this, void 0, void 0, function* () { });
    }
};
//TODO: dispose() => dispose api routes
//# sourceMappingURL=index.js.map