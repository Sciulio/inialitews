import fs from 'fs';
import path from 'path';

import Koa from 'koa';
import Router from 'koa-router';

import { MultiTenantContext, MultiTenantResxContext, multitenantPath } from "../../libs/multitenant";
import { fetchFileAudit } from '../../libs/audit';
import { checkForEffectivePath, error404 } from './helpers';

import { loadConfiguration } from '../../libs/config';

import morgan from 'koa-morgan';
const rfs = require('rotating-file-stream');


const config = loadConfiguration();

export const app = new Koa();
const router = new Router();

export async function init() {}


const logDirectory = path.join(process.cwd(), config.debug.logs.path);

app.use(morgan(':tenant :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { // 'combined'
  stream: rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
  })
}));

// responds to all but _api/*
router
.get("*", async function resxMiddleware(ctx: Koa.Context, next: () => Promise<any>) {
  /*
  Cache-Control: max-age=3600
  Content-Type
  Content-Language
  */

  const [absPath, relPath] = multitenantPath(ctx as MultiTenantContext);
  const ext = path.parse(relPath).ext;
  const url = relPath.replace(/\\/g, "/");

  const tenant = (ctx as MultiTenantContext).tenant;
  const tenantConfig = tenant.config;

  const dbItem = await fetchFileAudit(tenantConfig.name, url);
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

  ctx.response.set("Content-Length", dbItem.stats.size.toString());
  ctx.response.set("Content-Type", dbItem.content.type + "; charset=" + dbItem.content.charset);
  ctx.response.set("Cache-Control", dbItem.content.visibility + ", max-age=" + tenant.cacheMaxAge);
  ctx.response.set("Last-Modified", dbItem.content.lastModified);
  ctx.response.set("ETag", dbItem.stats.hash);
  /*ctx.etag = dbItem.hash;
  ctx.response.headers("ETag", dbItem.hash);
  ctx.response.etag = dbItem.hash;*/

  /*
  If-Match
  If-Unmodified-Since = "If-Unmodified-Since" ":" HTTP-date

  "If-None-Match" ":" ( "*" | 1#entity-tag )
  "If-Modified-Since" ":" HTTP-date (ex. Sat, 29 Oct 1994 19:43:31 GMT)

  Last-Modified
  
  if (ctx.request.get("If-None-Match") == dbItem.stats.hash) {
    debugger;
    ctx.status = 304;
    return;
  }*/

  // cache negotiation between If-None-Match / ETag, and If-Modified-Since and Last-Modified
  if (ctx.fresh) {
    ctx.status = 304;
    return;
  }

  //if ctx.is('image/*')

  const effectivePath = await checkForEffectivePath(ctx as MultiTenantResxContext);
  if (!effectivePath) {
    return error404(ctx);
  }

  ctx.body = await fs.createReadStream(effectivePath);
});
app
.use(router.routes())
.use(router.allowedMethods());