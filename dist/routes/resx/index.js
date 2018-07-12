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
const multitenant_1 = require("../../libs/multitenant");
function _fileExists(ctx, relPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            fs_1.default.exists(relPath, function (exist) {
                if (exist) {
                    fs_1.default.stat(relPath, (err, stats) => {
                        if (!err && stats.isFile()) {
                            res();
                        }
                        else {
                            ctx.status = 404; //TODO: set correct html status and error???
                            rej(`File ${relPath} not found!`);
                            //ctx.throw(err, 404);
                            //ctx.throw(404);
                        }
                    });
                }
                else {
                    ctx.status = 404;
                    rej(`File ${relPath} not found!`);
                    //ctx.throw(404);
                }
            });
        });
    });
}
function resxMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let relPath = multitenant_1.multitenantRelPath(ctx);
        const ext = path_1.default.parse(relPath).ext;
        relPath = path_1.default.join(process.cwd(), relPath);
        // not acceptable
        //const type = ext in mimeType || ctx.accepts('html', 'xml', 'text'); // TODO other resources and separateas middleware
        //if (type === false) ctx.throw(406);
        yield _fileExists(ctx, relPath);
        ctx.type = ext;
        ctx.body = fs_1.default.createReadStream(relPath);
    });
}
exports.resxMiddleware = resxMiddleware;
//# sourceMappingURL=index.js.map