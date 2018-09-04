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
const exporters_1 = require("../../libs/exporters");
const multitenant_1 = require("../../libs/multitenant");
const app = new koa_1.default();
exports.default = {
    order: 1000,
    app,
    route: "/_api",
    init: function (parentApp) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(` -  - INIT: App[${"/_api"}]`);
            yield exporters_1.loadExporters("./config/*.js", __dirname, " -  - LOAD: AppConfigurations")
                .mapAsync((configExport) => __awaiter(this, void 0, void 0, function* () {
                yield configExport.init(app);
            }));
            yield exporters_1.loadExporters("./services/*/index.js", __dirname, " -  - LOAD: Routes")
                .forEachAsync((routeExport) => __awaiter(this, void 0, void 0, function* () {
                //TODO: preroute
                routeExport.router.use(function (ctx, next) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const tenantName = ctx.tenant.name;
                        const api = ctx.api;
                        const apiName = routeExport.name;
                        api.name = apiName;
                        api.config = multitenant_1.getApiConfig(tenantName, apiName);
                        yield next();
                    });
                });
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