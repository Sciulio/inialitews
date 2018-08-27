import path from 'path';

import Koa from 'koa';

import shortid from 'shortid';

import { load } from 'dynamolo';
import { tApiExport } from './base';

import { loadConfiguration } from '../../libs/config';

import morgan from 'koa-morgan';
import { tAppRouteExporter } from '../../libs/types';
const rfs = require('rotating-file-stream');


const app = new Koa();

export default {
  order: 1000,
  app,
  route: "/_api",
  init: async function() {
    await load<tApiExport>(
      path.join(__dirname, "./*/index.js"), {
      exportDefault: true,
      logInfo: (...args: any[]) => console.log("\x1b[35m", "INFO", ...args, "\x1b[0m"),
      logError: (...args: any[]) => console.log("\x1b[31m", "ERROR", ...args, "\x1b[0m")
    })
    .forEachAsync(async apiExport => {
      app
      .use(apiExport.router.routes())
      .use(apiExport.router.allowedMethods());
  
      await apiExport.init();
    });
  }
} as tAppRouteExporter;


const config = loadConfiguration();

app.use(async function(ctx, next) {
  (ctx.res as any).requestId = (ctx as any).requestId = shortid();
  
  await next();
});

const logDirectory = path.join(process.cwd(), config.debug.logs.path);

app.use(morgan(':tenant :requestId :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { // 'combined'
  stream: rfs('apis.log', {
    interval: '1d', // rotate daily
    path: logDirectory
  })
}));