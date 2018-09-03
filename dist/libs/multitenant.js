"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
/*
TSL https://stackoverflow.com/questions/43156023/what-is-http-host-header
*/
const config = config_1.loadConfiguration();
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
    return config.tenants[host];
}
exports.multitenantStrategy = multitenantStrategy;
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
    //return path.join(config.target.root, ctx.tenant.staticPath, filePath, fileName);
    return path_1.default.join(filePath, fileName);
}
function multitenantPath(ctx) {
    const relPath = multitenantRelPath(ctx);
    //return [path.join(process.cwd(), relPath), relPath];
    return [path_1.default.join(process.cwd(), config.target.root, ctx.tenant.name, "www", relPath), relPath];
}
exports.multitenantPath = multitenantPath;
function getApiConfig(tenantName, apiName) {
    const tenants = config.tenants;
    const tenant = Object.keys(tenants)
        .map(host => tenants[host])
        .filter(tenant => tenant.name == tenantName)[0];
    return tenant.apis.filter(api => api.name == apiName)[0].options;
}
exports.getApiConfig = getApiConfig;
//# sourceMappingURL=multitenant.js.map