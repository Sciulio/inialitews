import Koa from 'koa';

import { tConfigExporter } from '../libs/exporters';
import { isProduction, processKey } from '../libs/workers';


export default {
  order: 10,
  init: async function (app: Koa) {
    if (!isProduction()) {
      app.use(async (ctx, next) => {
        ctx.set("TEST-X-Worker", processKey());

        await next();
      });
    }
  }
} as tConfigExporter;