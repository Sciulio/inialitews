"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mime_1 = require("../mime");
function apiMiddleware(req, res) {
    res.end({
        data: req.tenant.staticPath + ".bella"
    }, mime_1.mimeType[".json"]);
}
exports.apiMiddleware = apiMiddleware;
//# sourceMappingURL=index.js.map