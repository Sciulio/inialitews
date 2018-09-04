"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const path_1 = __importDefault(require("path"));
function urlToPath(_url) {
    // parse URL
    const parsedUrl = _url instanceof url_1.default.URL ? _url : url_1.default.parse(_url);
    // extract URL path
    let urlPathname = `.${parsedUrl.pathname}`;
    if (urlPathname.endsWith("/")) {
        urlPathname = path_1.default.join(urlPathname, "index.html");
    }
    let fileName = path_1.default.basename(urlPathname);
    let filePath = path_1.default.dirname(urlPathname);
    const fileExt = path_1.default.extname(urlPathname);
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
exports.urlToPath = urlToPath;
//# sourceMappingURL=url.js.map