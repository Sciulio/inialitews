import Koa from "koa";

import { tConfigExporter } from "../libs/exporters";


export default {
  order: 2000,
  init: async function (app: Koa) {
    app
    .use(mware);
  }
} as tConfigExporter;

async function mware(ctx: Koa.Context, next: () => void) {
  try {
    await next();
  } catch (err) {
    ctx.status = !err.status || err.status < 400 ? 500 : err.status;

    const bodyMessage = err.message || ctx.status == 404 ? 'Page Not Found' : "Something exploded!!!";

    switch (ctx.accepts('html', 'json')) {
      case 'html':
        ctx.type = 'html';
        ctx.body = `<h2>${ctx.status}</h2><p>${bodyMessage}</p>`;
        break;
      case 'json':
        ctx.type = 'json';
        ctx.body = {
          message: bodyMessage,
          error: bodyMessage
        };
        break;
      default:
        ctx.type = 'text';
        ctx.body = bodyMessage;
    }
    
    // since we handled this manually we'll want to delegate to the regular app
    // level error handling as well so that centralized still functions correctly.
    ctx.app.emit('error', err, ctx);
  }
};