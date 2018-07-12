import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import { MultiTenantContext, multitenantRelPath } from "../../libs/multitenant";


async function _fileExists(ctx: MultiTenantContext, relPath: string) {
  return new Promise((res, rej) => {
    fs.exists(relPath, function (exist) {
      if (exist) {
        fs.stat(relPath, (err, stats) => {
          if (!err && stats.isFile()) {
            res();
          } else {
            ctx.status = 404; //TODO: set correct html status and error???
            rej(`File ${relPath} not found!`);

            //ctx.throw(err, 404);
            //ctx.throw(404);
          }
        });
      } else {
        ctx.status = 404;
        rej(`File ${relPath} not found!`);

        //ctx.throw(404);
      }
    })
  });
}

export async function resxMiddleware(ctx: Koa.Context, next: () => Promise<any>) {
  let relPath = multitenantRelPath(ctx as MultiTenantContext);
  const ext = path.parse(relPath).ext;

  relPath = path.join(process.cwd(), relPath);

  // not acceptable
  //const type = ext in mimeType || ctx.accepts('html', 'xml', 'text'); // TODO other resources and separateas middleware
  //if (type === false) ctx.throw(406);

  await _fileExists(ctx as MultiTenantContext, relPath);

  ctx.type = ext;
  ctx.body = fs.createReadStream(relPath);
}