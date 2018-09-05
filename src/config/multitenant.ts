import Koa from 'koa';

import { multitenantStrategy, MultiTenantContext } from "../libs/multitenant";
import { tConfigExporter } from '../libs/exporters';


export default {
  order: 5000,
  init: async function (app: Koa) {
    app.use(multitenantMiddleware);
  }
} as tConfigExporter;

async function multitenantMiddleware(ctx: Koa.Context, next: () => Promise<any>) {
  const tenant = multitenantStrategy(ctx);

  if (tenant) {
    let locale = ctx.request.acceptsLanguages(tenant.locale).toString();

    if (locale == "*") {
      locale = tenant.locale[0];
    }

    (ctx as MultiTenantContext).tenant = {
      name: tenant.name,
      isDefaultLocale: locale == tenant.locale[0],
      cacheMaxAge: tenant.cacheMaxAge,
      locale
    };
    ctx.res.setHeader("X-Tenant", tenant.name);
  
    await next();
  } else {
    ctx.status = 507;
    throw new Error("Tenant not found!");
  }
};