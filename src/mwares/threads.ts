import Koa from 'koa';

import { tAppExporter } from '../libs/exporters';
import { isProduction, processKey } from '../libs/env';


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
} as tAppExporter;