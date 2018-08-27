import Koa from "koa";
import { tConfigExporter } from "../libs/types";


export default {
  order: 2000,
  init: async function (app: Koa) {
    app
    .use(async function(ctx, next) {
      try {
        await next();
      } catch (err) {
        ctx.status = err.status || 500;
    
        let bodyMessage = null;
        if (ctx.status == 404) {
          bodyMessage = err.message || 'Page Not Found';
        } else {
          bodyMessage = err.message || "Something exploded!!!";
        }
    
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
    });
  }
} as tConfigExporter;