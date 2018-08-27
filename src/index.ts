import path from 'path';

import "async-extensions";
import { load } from 'dynamolo';

import Koa from 'koa';
import Mount from 'koa-mount';

import { loadConfiguration } from './libs/config';

import { tConfigExporter, tAppRouteExporter, tServiceExporter } from './libs/types';


const config = loadConfiguration();

const dynamoloCommonConfig = {
  exportDefault: true,
  logInfo: (...args: any[]) => console.log("\x1b[35m", "INFO", ...args, "\x1b[0m"),
  logError: (...args: any[]) => console.log("\x1b[31m", "ERROR", ...args, "\x1b[0m")
};

function loadExporters<T>(_path: string) {
  return load<T>(path.join(__dirname, _path), dynamoloCommonConfig)
  .sort((a, b) => a.order > b.order ? 1 : -1)
};

(async function() {
  const app = new Koa();

  console.log(" - LOAD: App Configurations");
  await loadExporters<tConfigExporter>("./config/*.js")
  .mapAsync(async configExport => {
    await configExport.init(app);
  });

  console.log(" - LOAD: Services");
  await loadExporters<tServiceExporter>("./services/*.js")
  .mapAsync(async serviceExport => {
    await serviceExport.init(app);
  });

  console.log(" - MOUNT: AppedRoutes");
  await loadExporters<tAppRouteExporter>("./routes/*/index.js")
  .mapAsync(async appExport => {
    app.use(Mount(appExport.route, appExport.app));
    
    await appExport.init(app);
  });

  if (!module.parent) {
    const server = app
    .listen(config.server.port, () => {
      console.log('Server running on port:', config.server.port);
    });
  }
})();