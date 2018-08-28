import Koa from 'koa';


import { tApiExport } from './base';
import { tAppRouteExporter, loadExporters, tConfigExporter } from '../../libs/types';
import { MultiTenantApiContext } from '../../libs/multitenant';


const app = new Koa();

export default {
  order: 1000,
  app,
  route: "/_api",
  init: async function(parentApp: Koa) {
    console.log(` -  - INIT: App[${"/_api"}]`);

    console.log(" -  - LOAD: AppConfigurations");
    await loadExporters<tConfigExporter>("./config/*.js", __dirname)
    .mapAsync(async configExport => {
      await configExport.init(app);
    });

    console.log(" -  - LOAD: Routes");
    await loadExporters<tApiExport>("./services/*/index.js", __dirname)
    .forEachAsync(async routeExport => {
      app
      .use(routeExport.router.routes())
      .use(routeExport.router.allowedMethods());
  
      await routeExport.init();
    });
  },
  dispose: async function() {}
} as tAppRouteExporter;

//TODO: dispose() => dispose api routes

