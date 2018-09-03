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
const multitenant_1 = require("../libs/multitenant");
exports.default = {
    order: 5000,
    init: function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            app.use(multitenantMiddleware);
        });
    }
};
function multitenantMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const tenant = multitenant_1.multitenantStrategy(ctx);
        if (tenant) {
            let locale = ctx.request.acceptsLanguages(tenant.locale).toString();
            if (locale == "*") {
                locale = tenant.locale[0];
            }
            ctx.tenant = {
                name: tenant.name,
                isDefaultLocale: locale == tenant.locale[0],
                cacheMaxAge: tenant.cacheMaxAge,
                locale
            };
            ctx.res.setHeader("X-Tenant", tenant.name);
            yield next();
        }
        else {
            ctx.status = 507;
            throw new Error("Tenant not found!");
        }
    });
}
;
//# sourceMappingURL=multitenant.js.map