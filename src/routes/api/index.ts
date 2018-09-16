import Koa from 'koa';

import { tApiExport } from './libs/exporters';
import { tAppRouteExporter, loadExporters, tAppExporter } from '../../libs/exporters';
import { MultiTenantApiContext, getApiConfig } from '../../libs/multitenant';
import { logger } from '../../libs/logger';


const app = new Koa();

export default {
  order: 1000,
  app,
  route: "/_api",
  init: async function(parentApp: Koa) {
    logger.info(` -  - INIT: App[${"/_api"}]`);

    await loadExporters<tAppExporter>("./mwares/*.js", " -  - LOAD: AppConfigurations", __dirname)
    .mapAsync(async configExport => {
      await configExport.init(app);
    });

    await loadExporters<tApiExport>("./services/*/index.js", " -  - LOAD: Routes", __dirname)
    .forEachAsync(async routeExport => {
      //TODO: preroute
      routeExport.router.use(async function(ctx, next) {
        const tenantName = (ctx as MultiTenantApiContext).tenant.name;
        const api = (ctx as MultiTenantApiContext).api;
        const apiName = routeExport.name;

        api.name = apiName;
        api.config = getApiConfig(tenantName, apiName);

        await next();
      });

      app
      .use(routeExport.router.routes())
      .use(routeExport.router.allowedMethods());
  
      await routeExport.init();
    });
  },
  dispose: async function() {}
} as tAppRouteExporter;

//TODO: dispose() => dispose api routes