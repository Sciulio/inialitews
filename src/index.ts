import "async-extensions";

import Koa from 'koa';
import Mount from 'koa-mount';

import { loadConfiguration } from './libs/config';

import { tConfigExporter, tAppRouteExporter, tServiceExporter, loadExporters } from './libs/types';


const config = loadConfiguration();

(async function() {
  const app = new Koa();

  console.log(" - LOAD: App Configurations");
  await loadExporters<tConfigExporter>("./config/*.js", __dirname)
  .mapAsync(async configExport => {
    await configExport.init(app);
  });

  console.log(" - LOAD: Services");
  await loadExporters<tServiceExporter>("./services/*.js", __dirname)
  .mapAsync(async serviceExport => {
    await serviceExport.init(app);
  });

  console.log(" - MOUNT: AppedRoutes");
  await loadExporters<tAppRouteExporter>("./routes/*/index.js", __dirname)
  .mapAsync(async appExport => {
    app.use(Mount(appExport.route, appExport.app));
    
    await appExport.init(app);
  });

  //TODO: on app terminate execute dynamiclyloadedmodules dispose()

  if (!module.parent) {
    const server = app
    .listen(config.server.port, () => {
      console.log('Server running on port:', config.server.port);
    });
  }
})();