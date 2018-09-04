"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function error404(ctx) {
    ctx.status = 404;
    //TODO: load 404 page
    ctx.body = "ERROREE 404!";
}
exports.error404 = error404;
//# sourceMappingURL=errors.js.map