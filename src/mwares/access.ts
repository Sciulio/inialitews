
import Koa from 'koa';

import { tConfigExporter } from '../libs/exporters';
import { MultiTenantContext, MultiTenantApiContext } from '../libs/multitenant';
import { accessLogger } from '../libs/logger';


export default {
  order: 100,
  init: async function (app: any) {
    app.use(mware);
  }
} as tConfigExporter;

async function mware(ctx: Koa.Context, next: () => Promise<any>) {
  const requestOn = Date.now();
  
  (ctx as MultiTenantContext).access = {
    requestOn
  };

  await next();

  const requestDuration = Date.now() - requestOn;
  const requestId = (ctx as MultiTenantApiContext).api ? (ctx as MultiTenantApiContext).api.requestId : "RESX";
  const tenantName = (ctx as MultiTenantContext).tenant.name;
  const requestIp = ctx.ip || ctx.request.ip || (ctx.req.connection && ctx.req.connection.remoteAddress) || "NO_IP";
  const referrer = ctx.req.headers['referrer'] || "NO_REF";
  const userAgent = ctx.req.headers['user-agent'] || "NO_AGENT";

  accessLogger.info(`[${requestOn}, ${requestDuration}] ${ctx.response.status} - ${requestId} - ${tenantName} - ${ctx.req.httpVersion}-${ctx.request.method}::${ctx.request.url} [${referrer}] - ${requestIp}::${userAgent}`);
};