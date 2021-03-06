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
const koa_compress_1 = __importDefault(require("koa-compress"));
exports.default = {
    order: 1000,
    init: function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            app
                .use(koa_compress_1.default({
                /*filter: function (content_type) {
                  return /text/i.test(content_type)
                },*/
                threshold: 2048,
                flush: require('zlib').Z_SYNC_FLUSH
            }));
        });
    }
};
//# sourceMappingURL=compress.js.map