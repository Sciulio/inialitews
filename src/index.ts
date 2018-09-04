import "async-extensions";

import Koa from 'koa';
import Mount from 'koa-mount';

import { logger } from "./libs/logger";

import { loadConfiguration } from './libs/config';

import { tConfigExporter, tAppRouteExporter, tServiceExporter, loadExporters } from './libs/exporters';


const config = loadConfiguration();

(async function() {
  const app = new Koa();

  await loadExporters<tConfigExporter>("./config/*.js", __dirname, " - LOAD: App Configurations")
  .mapAsync(async configExport => {
    await configExport.init(app);
  });

  await loadExporters<tServiceExporter>("./services/*/index.js", __dirname, " - LOAD: Services")
  .mapAsync(async serviceExport => {
    await serviceExport.init(app);
  });

  await loadExporters<tAppRouteExporter>("./routes/*/index.js", __dirname, " - MOUNT: AppedRoutes")
  .mapAsync(async appExport => {
    app.use(Mount(appExport.route, appExport.app));
    
    await appExport.init(app);
  });

  //TODO: on app terminate execute dynamiclyloadedmodules dispose()

  if (!module.parent) {
    const server = app
    .listen(config.server.port, () => {
      logger.info(`Server running on port: ${config.server.port}`);
    });


    //app.on("error", () => {});
    server.on("error", (err) => {
      logger.error("KOA ERROR HANDLER", err)
    });
    process.on('uncaughtException', (err) => {
      logger.error("PROCESS ERROR HANDLER", err);
    });

    process
    .on("beforeExit", onExit)
    .on("SIGINT", onExit)
    .on("SIGTERM", onExit);

    let isClosing = false;
    function onExit() {
      if (isClosing) {
        return;
      }
      isClosing = true;

      server.close(function() {
        //TODO: dispose loaded entities

        process.exit(0);
      });
    };
  } else {
    process.on("disconnect", () => {
      logger.error("disconnetting child process!");
    });
  }
})();