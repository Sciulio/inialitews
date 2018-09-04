import url from 'url';
import path from 'path';
import { loadConfiguration, tTenantConfig } from './config';
import Koa from 'koa';
import { urlToPath } from './url';


/*
TSL https://stackoverflow.com/questions/43156023/what-is-http-host-header
*/

const config = loadConfiguration();

export type MultiTenantContext = Koa.Context & {
  tenant: {
    name: string;
    
    locale: string;
    isDefaultLocale: boolean;
    cacheMaxAge: number;

    //config: tTenantConfig;
  };
}
export type MultiTenantResxContext = MultiTenantContext & {
  resx: {
    absPath: string;
    relPath: string;
    ext: string;
    isLocalizable: boolean;
  };
}
export type MultiTenantApiContext = MultiTenantContext & {
  api: {
    requestId: string;
    
    name?: string;
    config?: any;
    //isLocalizable: boolean;
  };
}

export function multitenantStrategy(ctx: Koa.Context) {
  let host = "";
  
  if (ctx.host) {
    host = ctx.host.split(":")[0]; // split port
  } else if (!!ctx.request.headers.host) {
    host = ctx.request.headers.host.split(':')[0];
  } else if (!!ctx.originalUrl) {
    host = ctx.originalUrl.replace("::ffff:", "");
  }

  return config.tenants[host];
}

export function multitenantPath(ctx: MultiTenantContext) {
  const relPath = urlToPath(ctx.URL); // url.url
  const absPath = path.join(process.cwd(), config.target.root, ctx.tenant.name, "www", relPath);

  return [absPath, relPath];
}

export function getApiConfig(tenantName: string, apiName: string) {
  const tenants = config.tenants;
  const tenant = Object.keys(tenants)
  .map(host => tenants[host])
  .filter(tenant => tenant.name == tenantName)[0];
  
  return tenant.apis.filter(api => api.name == apiName)[0].options;
}