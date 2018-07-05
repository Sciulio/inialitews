"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multitenant_1 = require("../../libs/multitenant");
const mime_1 = require("../mime");
function resxMiddleware(req, res) {
    const fullPath = multitenant_1.multitenantPath(req);
    fs_1.default.exists(fullPath, function (exist) {
        //TODO use middlewares to send error pages
        if (!exist) {
            // if the file is not found, return 404
            res.statusCode = 404;
            res.end(`File ${fullPath} not found!`);
            return;
        }
        // read file from file system
        fs_1.default.readFile(fullPath, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            }
            else {
                // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                const ext = path_1.default.parse(fullPath).ext;
                // if the file is found, set Content-type and send data
                res.setHeader('Content-type', mime_1.mimeType[ext] || 'text/plain');
                res.end(data);
            }
        });
    });
}
exports.resxMiddleware = resxMiddleware;
//# sourceMappingURL=index.js.map