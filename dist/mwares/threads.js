"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../libs/env");
exports.default = {
    order: 10,
    init: function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!env_1.isProduction()) {
                app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    ctx.set("TEST-X-Worker", env_1.processKey());
                    yield next();
                }));
            }
        });
    }
};
//# sourceMappingURL=threads.js.map