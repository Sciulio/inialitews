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
const helpers_1 = require("./helpers");
const types_1 = require("../../libs/types");
const rfs = require('rotating-file-stream');
const app = new koa_1.default();
exports.default = {
    order: 1000,
    app,
    route: "/",
    init: function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(` -  - INIT: App[${"/"}]`);
            console.log(" -  - LOAD: App Configurations");
            yield types_1.loadExporters("./config/*.js", __dirname)
                .mapAsync((configExport) => __awaiter(this, void 0, void 0, function* () {
                yield configExport.init(app);
            }));
            console.log(" -  - LOAD: App Routes");
            app
                .use(router.routes())
                .use(router.allowedMethods());
        });
    },
    dispose: function () {
        return __awaiter(this, void 0, void 0, function* () { });
    }
};
const router = new koa_router_1.default();
// responds to all but _api/*
router
    .get("*", function resxMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const [absPath, relPath] = multitenant_1.multitenantPath(ctx);
        const ext = path_1.default.parse(relPath).ext;
        const url = relPath.replace(/\\/g, "/");
        const tenant = ctx.tenant;
        const tenantConfig = tenant.config;
        const dbItem = yield audit_1.fetchFileAudit(tenantConfig.name, url);
        if (!dbItem) {
            return helpers_1.error404(ctx);
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
        ctx.response.set("Content-Length", dbItem.stats.size.toString());
        ctx.response.set("Content-Type", dbItem.content.type + "; charset=" + dbItem.content.charset);
        ctx.response.set("Cache-Control", dbItem.content.visibility + ", max-age=" + tenant.cacheMaxAge);
        ctx.response.set("Last-Modified", dbItem.content.lastModified);
        ctx.response.set("ETag", dbItem.stats.hash);
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
        const effectivePath = yield helpers_1.checkForEffectivePath(ctx);
        if (!effectivePath) {
            return helpers_1.error404(ctx);
        }
        ctx.body = yield fs_1.default.createReadStream(effectivePath);
    });
});
//# sourceMappingURL=index.js.map