import Koa from 'koa';

import shortid from 'shortid';

import { tAppExporter } from "../../../libs/exporters";
import { MultiTenantApiContext } from '../../../libs/multitenant';


export default {
  order: 5000,
  init: async function(app: Koa) {
    app.use(multitenantMiddleware);
  }
} as tAppExporter;

async function multitenantMiddleware(ctx: Koa.Context, next: () => Promise<any>) {
  const requestId = (ctx.res as any).requestId = shortid();
  
  (ctx as MultiTenantApiContext).api = {
    requestId
  };

  await next();
};