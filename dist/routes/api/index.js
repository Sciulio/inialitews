"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function apiMiddleware(ctx, next) {
    ctx.status = 200;
    ctx.type = ".json";
    ctx.body = ctx.tenant.staticPath;
}
exports.apiMiddleware = apiMiddleware;
//# sourceMappingURL=index.js.map