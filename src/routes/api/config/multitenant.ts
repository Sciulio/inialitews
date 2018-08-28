import Koa from 'koa';

import shortid from 'shortid';

import { tConfigExporter } from "../../../libs/types";
import { MultiTenantApiContext } from '../../../libs/multitenant';


export default {
  order: 5000,
  init: async function(app: Koa) {
    app.use(multitenantMiddleware);
  }
} as tConfigExporter;

async function multitenantMiddleware(ctx: Koa.Context, next: () => Promise<any>) {
  const requestId = shortid();
  (ctx as MultiTenantApiContext).api = {
    requestId
  };
  (ctx.res as any).requestId = requestId;

  await next();
};