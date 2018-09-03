import Koa from 'koa';
import { IRouterContext } from 'koa-router';

import { tApiExport } from './base';
import { tAppRouteExporter, loadExporters, tConfigExporter } from '../../libs/types';
import { MultiTenantApiContext, getApiConfig } from '../../libs/multitenant';


const app = new Koa();

export default {
  order: 1000,
  app,
  route: "/_api",
  init: async function(parentApp: Koa) {
    console.log(` -  - INIT: App[${"/_api"}]`);

    await loadExporters<tConfigExporter>("./config/*.js", __dirname, " -  - LOAD: AppConfigurations")
    .mapAsync(async configExport => {
      await configExport.init(app);
    });

    await loadExporters<tApiExport>("./services/*/index.js", __dirname, " -  - LOAD: Routes")
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