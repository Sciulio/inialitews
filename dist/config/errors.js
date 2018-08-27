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
exports.default = {
    order: 3000,
    init: function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            app
                .on('error', function (err) {
                if (process.env.NODE_ENV != 'test') {
                    console.log('sent error %s to the cloud', err.message);
                    console.log(err);
                }
            });
        });
    }
};
//# sourceMappingURL=errors.js.map