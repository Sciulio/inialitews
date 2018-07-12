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
const url_1 = __importDefault(require("url"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
function multitenantStrategy(ctx) {
    let host = "";
    if (ctx.host) {
        host = ctx.host.split(":")[0]; // split port
    }
    else if (!!ctx.request.headers.host) {
        host = ctx.request.headers.host.split(':')[0];
    }
    else if (!!ctx.originalUrl) {
        host = ctx.originalUrl.replace("::ffff:", "");
    }
    return config_1.loadConfiguration().tenants[host];
}
function multitenantMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const tenant = multitenantStrategy(ctx);
        if (tenant) {
            ctx.tenant = {
                staticPath: tenant.name
            };
            ctx.res.setHeader("X-Tenant", tenant.name);
            yield next();
        }
        else {
            ctx.status = 507;
            throw new Error("Tenant not found!");
        }
    });
}
exports.multitenantMiddleware = multitenantMiddleware;
;
function multitenantRelPath(ctx) {
    const _url = ctx.url || "";
    // parse URL
    const parsedUrl = url_1.default.parse(_url);
    // extract URL path
    let pathnameUrl = `.${parsedUrl.pathname}`;
    if (pathnameUrl.endsWith("/")) {
        pathnameUrl = path_1.default.join(pathnameUrl, "index.html");
    }
    let fileName = path_1.default.basename(pathnameUrl);
    let filePath = path_1.default.dirname(pathnameUrl);
    const fileExt = path_1.default.extname(pathnameUrl);
    if (!fileExt) {
        fileName += ".html";
    }
    if (filePath[0] != "/") {
        filePath = "/" + filePath;
    }
    filePath = path_1.default.normalize(filePath);
    return path_1.default.join(config_1.loadConfiguration().target.root, ctx.tenant.staticPath, filePath, fileName);
}
exports.multitenantRelPath = multitenantRelPath;
//# sourceMappingURL=multitenant.js.map