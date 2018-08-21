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
const koa_router_1 = __importDefault(require("koa-router"));
const multitenant_1 = require("../../libs/multitenant");
const audit_1 = require("../../libs/audit");
exports.router = new koa_router_1.default();
function checkFile(_path) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            fs_1.default.exists(_path, function (exist) {
                if (exist) {
                    fs_1.default.stat(_path, (err, stats) => {
                        if (err) {
                            rej();
                        }
                        else {
                            res(stats.isFile());
                        }
                    });
                }
                else {
                    res(false);
                }
            });
        });
    });
}
function checkForEffectivePath(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        let _path = ctx.resx.absPath;
        if (ctx.resx.isLocalizable && !ctx.tenant.isDefaultLocale) {
            const localizedPath = _path + "." + ctx.tenant.locale;
            if (yield checkFile(localizedPath)) {
                return localizedPath;
            }
        }
        if (yield checkFile(_path)) {
            return _path;
        }
        return null;
    });
}
// responds to all but _api/*
exports.router
    .get("*", function resxMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
        Cache-Control: max-age=3600
        Content-Type
        Content-Language
        */
        const [absPath, relPath] = multitenant_1.multitenantPath(ctx);
        const ext = path_1.default.parse(relPath).ext;
        const url = relPath.replace(/\\/g, "/");
        const tenant = ctx.tenant;
        const dbItem = yield audit_1.fetchFileAudit(tenant.staticPath, url);
        if (!dbItem) {
            ctx.status = 404;
            ctx.body = "ERROREE 404: " + relPath;
            //ctx.throw("ERROREE 404!");
            return;
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
        /*ctx.etag = dbItem.hash;
        ctx.response.headers("ETag", dbItem.hash);
        ctx.response.etag = dbItem.hash;*/
        /*
        If-Match
        If-Unmodified-Since = "If-Unmodified-Since" ":" HTTP-date
      
        "If-None-Match" ":" ( "*" | 1#entity-tag )
        "If-Modified-Since" ":" HTTP-date (ex. Sat, 29 Oct 1994 19:43:31 GMT)
      
        Last-Modified
        
        if (ctx.request.get("If-None-Match") == dbItem.stats.hash) {
          debugger;
          ctx.status = 304;
          return;
        }*/
        // cache negotiation between If-None-Match / ETag, and If-Modified-Since and Last-Modified
        if (ctx.fresh) {
            ctx.status = 304;
            return;
        }
        //if ctx.is('image/*')
        const effectivePath = yield checkForEffectivePath(ctx);
        if (!effectivePath) {
            //ctx.status = 500;
            //ctx.body = "ERROREE 500: " + relPath;
            ctx.status = 404; //TODO: set correct html status and error???
            ctx.body = "ERROREE 404: " + relPath;
            return;
        }
        ctx.body = yield fs_1.default.createReadStream(effectivePath);
    });
});
//# sourceMappingURL=index.js.map