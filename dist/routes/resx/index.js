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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const multitenant_1 = require("../../libs/multitenant");
const audit_1 = require("../../services/audit");
const errors_1 = require("./libs/errors");
const exporters_1 = require("../../libs/exporters");
const files_1 = require("./libs/files");
const logger_1 = require("../../libs/logger");
const app = new koa_1.default();
exports.default = {
    order: 1000,
    app,
    route: "/",
    init: function () {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info(` -  - INIT: App[${"/"}]`);
            logger_1.logger.info(" -  - LOAD: App Routes");
            const router = initRouter();
            app
                .use(router.routes())
                .use(router.allowedMethods());
            yield exporters_1.loadExporters("./mwares/*.js", " -  - LOAD: App Configurations", __dirname)
                .mapAsync((configExport) => __awaiter(this, void 0, void 0, function* () {
                yield configExport.init(app);
            }));
        });
    },
    dispose: function () {
        return __awaiter(this, void 0, void 0, function* () { });
    }
};
function initRouter() {
    const router = new koa_router_1.default();
    // responds to all but _api/*
    router
        .get("*", function resxMiddleware(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const [absPath, relPath] = multitenant_1.multitenantPath(ctx);
            const ext = path_1.default.parse(relPath).ext;
            const url = relPath.replace(/\\/g, "/");
            const tenant = ctx.tenant;
            const dbItem = yield audit_1.fetchFileAudit(tenant.name, url);
            if (!dbItem) {
                return errors_1.error404(ctx);
            }
            //TODO: read this information from db => dbItem.isLocalizable
            ctx.resx = {
                //path: _path,
                absPath,
                relPath,
                ext,
                isLocalizable: dbItem.has && dbItem.has["locale"]
            };
            ctx.status = 200;
            //const type = ext in mimeType || ctx.accepts('html', 'xml', 'text'); // TODO other resources and separateas middleware
            //if (type === false) ctx.throw(406);
            ctx.type = ext;
            // https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
            const dbItemStats = dbItem.stats;
            const dbItemContent = dbItem.content;
            ctx.response.set("Content-Length", dbItemStats.size.toString());
            ctx.response.set("Content-Type", dbItemContent.type + "; charset=" + dbItemContent.charset);
            ctx.response.set("Cache-Control", dbItemContent.visibility + ", max-age=" + tenant.cacheMaxAge);
            ctx.response.set("Last-Modified", dbItemContent.lastModified);
            ctx.response.set("ETag", dbItemStats.hash);
            /*
            If-Match
            If-Unmodified-Since = "If-Unmodified-Since" ":" HTTP-date
            "If-None-Match" ":" ( "*" | 1#entity-tag )
            "If-Modified-Since" ":" HTTP-date (ex. Sat, 29 Oct 1994 19:43:31 GMT)
            Last-Modified
            */
            // cache negotiation between If-None-Match / ETag, and If-Modified-Since and Last-Modified
            if (ctx.fresh) {
                ctx.status = 304;
                return;
            }
            //if ctx.is('image/*')
            const effectivePath = yield files_1.getResxPath(ctx);
            if (!effectivePath) {
                return errors_1.error404(ctx);
            }
            ctx.body = yield fs_1.default.createReadStream(effectivePath);
        });
    });
    return router;
}
;
//# sourceMappingURL=index.js.map