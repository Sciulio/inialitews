import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import { MultiTenantContext, MultiTenantResxContext, multitenantPath } from "../../libs/multitenant";
import { fetchFileAudit } from '../../libs/audit';


export const router = new Router();

async function checkFile(_path: string) {
  return new Promise((res, rej) => {
    fs.exists(_path, function (exist) {
      if (exist) {
        fs.stat(_path, (err, stats) => {
          if (err) {
            rej();
          } else {
            res(stats.isFile());
          }
        });
      } else {
        res(false);
      }
    })
  });
}
async function checkForEffectivePath(ctx: MultiTenantResxContext): Promise<string|null> {
  let _path = ctx.resx.absPath;

  if (ctx.resx.isLocalizable && !ctx.tenant.isDefaultLocale) {
    const localizedPath = _path + "." + ctx.tenant.locale;

    if (await checkFile(localizedPath)) {
      return localizedPath;
    }
  }

  if (await checkFile(_path)) {
    return _path;
  }
  
  return null;
}

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

  const dbItem = await fetchFileAudit(tenant.staticPath, url);
  if (!dbItem) {
    ctx.status = 404;
    ctx.body = "ERROREE 404: " + relPath;
    //ctx.throw("ERROREE 404!");

    return;
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
    //ctx.status = 500;
    //ctx.body = "ERROREE 500: " + relPath;
    ctx.status = 404; //TODO: set correct html status and error???
    ctx.body = "ERROREE 404: " + relPath;

    return;
  }

  ctx.body = await fs.createReadStream(effectivePath);
});