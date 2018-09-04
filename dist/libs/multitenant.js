"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const url_1 = require("./url");
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
function multitenantPath(ctx) {
    const relPath = url_1.urlToPath(ctx.URL); // url.url
    const absPath = path_1.default.join(process.cwd(), config.target.root, ctx.tenant.name, "www", relPath);
    return [absPath, relPath];
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