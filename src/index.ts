import "async-extensions";

import Koa from 'koa';
import Mount from 'koa-mount';
import cluster from 'cluster';

import { logger } from "./libs/logger";

import { loadConfiguration } from './libs/config';

import { tConfigExporter, tAppRouteExporter, tServiceExporter, loadExporters } from './libs/exporters';
import { isMasterProcess, processId } from "./libs/clustering";


const config = loadConfiguration();

(async function() {
  if (isMasterProcess()) {
    // process config/handling
    process
    .on('uncaughtException', (err) => {
      logger.error("PROCESS ERROR HANDLER", err);
    })
    //.on('unhandledRejection', (err) => { ... })
    .on("beforeExit", onExit)
    .on("SIGINT", onExit)
    .on("SIGTERM", onExit);

    let isClosing = false;
    function onExit() {
      if (isClosing) {
        return;
      }
      isClosing = true;
    };

    // Start child threads
    const cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i++) {
        cluster.fork();
    }
  } else {
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
    
    // server config/handling
    const server = app
    .listen(config.server.port, () => {
      logger.info(`Server (process ${processId()}) running on port: ${config.server.port}`);
    });

    // app.on("error", () => {});
    server.on("error", (err) => {
      logger.error("KOA ERROR HANDLER", err)
    });

    process.on("disconnect", () => {
      logger.error("disconnetting child process: " + processId());

      server.close(function() {
        //TODO: dispose loaded entities
        process.exit(0);
      });
    });
  }
})();