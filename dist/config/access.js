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
const logger_1 = require("../libs/logger");
exports.default = {
    order: 100,
    init: function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
                const requestOn = Date.now();
                ctx.access = {
                    requestOn
                };
                yield next();
                const requestDuration = Date.now() - requestOn;
                const requestId = ctx.api ? ctx.api.requestId : "RESX";
                const tenantName = ctx.tenant.name;
                const requestIp = ctx.ip || ctx.request.ip || (ctx.req.connection && ctx.req.connection.remoteAddress) || "NO_IP";
                const referrer = ctx.req.headers['referrer'] || "NO_REF";
                const userAgent = ctx.req.headers['user-agent'] || "NO_AGENT";
                logger_1.accessLogger.info(`[${requestOn}, ${requestDuration}] ${ctx.response.status} - ${requestId} - ${tenantName} - ${ctx.req.httpVersion}-${ctx.request.method}::${ctx.request.url} [${referrer}] - ${requestIp}::${userAgent}`);
            }));
        });
    }
};
//# sourceMappingURL=access.js.map