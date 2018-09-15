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
    order: 2000,
    init: function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            app
                .use(mware);
        });
    }
};
function mware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield next();
        }
        catch (err) {
            ctx.status = !err.status || err.status < 400 ? 500 : err.status;
            const bodyMessage = err.message || ctx.status == 404 ? 'Page Not Found' : "Something exploded!!!";
            switch (ctx.accepts('html', 'json')) {
                case 'html':
                    ctx.type = 'html';
                    ctx.body = `<h2>${ctx.status}</h2><p>${bodyMessage}</p>`;
                    break;
                case 'json':
                    ctx.type = 'json';
                    ctx.body = {
                        message: bodyMessage,
                        error: bodyMessage
                    };
                    break;
                default:
                    ctx.type = 'text';
                    ctx.body = bodyMessage;
            }
            // since we handled this manually we'll want to delegate to the regular app
            // level error handling as well so that centralized still functions correctly.
            ctx.app.emit('error', err, ctx);
        }
    });
}
;
//# sourceMappingURL=routecatch.js.map