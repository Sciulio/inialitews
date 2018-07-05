"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
class MultiTenantIncomingMessage extends http_1.default.IncomingMessage {
    constructor() {
        super(...arguments);
        this.tenant = null;
    }
}
exports.MultiTenantIncomingMessage = MultiTenantIncomingMessage;
function multitenantStrategy(req) {
    let host = "";
    if (!!req.headers.host) {
        host = req.headers.host.split(':')[0];
    }
    else if (!!req.connection.localAddress) {
        host = req.connection.localAddress.replace("::ffff:", "");
    }
    return config_1.loadConfiguration().tenants[host];
}
function multitenantMiddleware(req, res, next) {
    console.log("Check if vaild request!");
    console.log(`${req.method} ${req.url}`);
    const tenant = multitenantStrategy(req);
    if (tenant) {
        req.tenant = {
            staticPath: tenant.name
        };
        next();
    }
    else {
        res.statusCode = 404;
        //TODO: set correct mimetype for request
        res.end(`Tenant not found!`);
    }
}
exports.multitenantMiddleware = multitenantMiddleware;
;
function multitenantPath(req) {
    const _url = req.url || "";
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
    return path_1.default.join(config_1.loadConfiguration().target.root, req.tenant.staticPath, filePath, fileName);
}
exports.multitenantPath = multitenantPath;
//# sourceMappingURL=multitenant.js.map