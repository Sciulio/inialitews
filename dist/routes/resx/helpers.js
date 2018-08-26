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
exports.checkForEffectivePath = checkForEffectivePath;
function error404(ctx) {
    ctx.status = 404;
    //TODO: load 404 page
    ctx.body = "ERROREE 404!";
}
exports.error404 = error404;
//# sourceMappingURL=helpers.js.map