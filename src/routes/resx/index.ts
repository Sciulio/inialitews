import fs from 'fs';
import path from 'path';

import Koa from 'koa';
import Router from 'koa-router';

import { MultiTenantContext, MultiTenantResxContext, multitenantPath } from "../../libs/multitenant";
import { fetchFileAudit } from '../../services/audit';
import { error404 } from "./libs/errors";

import { tAppRouteExporter, loadExporters, tConfigExporter } from '../../libs/exporters';
import { getResxPath } from './libs/files';
import { logger } from '../../libs/logger';
import { tFileAudit } from '../../services/audit/types';


const app = new Koa();

export default {
  order: 1000,
  app,
  route: "/",
  init: async function() {
    logger.info(` -  - INIT: App[${"/"}]`);
    
    logger.info(" -  - LOAD: App Routes");
    const router = initRouter();
    
    app
    .use(router.routes())
    .use(router.allowedMethods());
    
    await loadExporters<tConfigExporter>("./mwares/*.js", " -  - LOAD: App Configurations", __dirname)
    .mapAsync(async configExport => {
      await configExport.init(app);
    });
  },
  dispose: async function() {}
} as tAppRouteExporter;


function initRouter() {
  const router = new Router();

  // responds to all but _api/*
  router
  .get("*", async function resxMiddleware(ctx: Koa.Context, next: () => Promise<any>) {
    const [absPath, relPath] = multitenantPath(ctx as MultiTenantContext);
    const ext = path.parse(relPath).ext;
    const url = relPath.replace(/\\/g, "/");

    const tenant = (ctx as MultiTenantContext).tenant;

    const dbItem = await fetchFileAudit<tFileAudit>(tenant.name, url);
    if (!dbItem) {
      return error404(ctx);
    }

    //TODO: read this information from db => dbItem.isLocalizable
    (ctx as MultiTenantResxContext).resx = {
      //path: _path,
      absPath,
      relPath,
      ext,
      isLocalizable: dbItem.has && dbItem.has["locale"]
    };

    ctx.status = 200;
    //const type = ext in mimeType || ctx.accepts('html', 'xml', 'text'); // TODO other resources and separateas middleware
    //if (type === false) ctx.throw(406);
    ctx.type = ext;

    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html

    const dbItemStats = dbItem.stats;
    const dbItemContent = dbItem.content;

    ctx.response.set("Content-Length", dbItemStats.size.toString());
    ctx.response.set("Content-Type", dbItemContent.type + "; charset=" + dbItemContent.charset);
    ctx.response.set("Cache-Control", dbItemContent.visibility + ", max-age=" + tenant.cacheMaxAge);
    ctx.response.set("Last-Modified", dbItemContent.lastModified);
    ctx.response.set("ETag", dbItemStats.hash);

    /*
    If-Match
    If-Unmodified-Since = "If-Unmodified-Since" ":" HTTP-date
    "If-None-Match" ":" ( "*" | 1#entity-tag )
    "If-Modified-Since" ":" HTTP-date (ex. Sat, 29 Oct 1994 19:43:31 GMT)
    Last-Modified
    */

    // cache negotiation between If-None-Match / ETag, and If-Modified-Since and Last-Modified
    if (ctx.fresh) {
      ctx.status = 304;
      return;
    }

    //if ctx.is('image/*')

    const effectivePath = await getResxPath(ctx as MultiTenantResxContext);
    if (!effectivePath) {
      return error404(ctx);
    }

    ctx.body = await fs.createReadStream(effectivePath);
  });

  return router;
};