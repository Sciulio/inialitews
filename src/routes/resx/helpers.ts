import fs from 'fs';

import Koa from 'koa';

import { MultiTenantResxContext } from "../../libs/multitenant";


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

export async function checkForEffectivePath(ctx: MultiTenantResxContext): Promise<string|null> {
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

export function error404(ctx: Koa.Context) {
  ctx.status = 404;
  //TODO: load 404 page
  ctx.body = "ERROREE 404!";
}