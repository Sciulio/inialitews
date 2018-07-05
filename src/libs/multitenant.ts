import http from 'http';
import url from 'url';
import path from 'path';
import { loadConfiguration } from './config';
import { NextFunction } from 'connect';


export class MultiTenantIncomingMessage extends http.IncomingMessage {
  public tenant: {
    staticPath: string;
  } = null as any;
}

function multitenantStrategy(req: http.IncomingMessage) {
  const ra = req.connection.remoteAddress || "";
  return loadConfiguration().tenants[ra];
}

export function multitenantMiddleware(req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction){
  console.log("Check if vaild request!");
  console.log(`${req.method} ${req.url}`);

  const tenant = multitenantStrategy(req);

  if (tenant) {
    (req as MultiTenantIncomingMessage).tenant = {
      staticPath: tenant.name
    };
  
    next();
  } else {
    res.statusCode = 404;
    res.end(`Tenant not found!`);
  }
};

export function multitenantPath(req: MultiTenantIncomingMessage): string {
  const _url = req.url || "";

  // parse URL
  const parsedUrl = url.parse(_url);
  // extract URL path
  let pathnameUrl = `.${parsedUrl.pathname}`;

  if (pathnameUrl.endsWith("/")) {
    pathnameUrl = path.join(pathnameUrl, "index.html");
  }

  let fileName = path.basename(pathnameUrl);
  let filePath = path.dirname(pathnameUrl);
  const fileExt = path.extname(pathnameUrl);

  if (!fileExt) {
    fileName += ".html";
  }

  if (filePath[0] != "/") {
    filePath = "/" + filePath;
  }
  filePath = path.normalize(filePath);

  return path.join(loadConfiguration().target.root, req.tenant.staticPath, filePath, fileName);
}