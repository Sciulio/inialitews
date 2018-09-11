import "async-extensions";

import Koa from 'koa';
import Mount from 'koa-mount';
import cluster from 'cluster';

import { logger } from "./libs/logger";

import { loadConfiguration } from './libs/config';

import { tConfigExporter, tAppRouteExporter, tServiceExporter, loadExporters } from './libs/exporters';
import { isMasterProcess, workerId, isProduction } from "./libs/clustering";
import { config as cbusConfig } from "./libs/clusterbus";


const config = loadConfiguration();

(async function() {
  executeAnyProcess();

  if (!isProduction()) {
    if (isMasterProcess()) {
      await executeMasterProcess();
    } else {
      await executeChildProcess();
    }
  } else {
    executeChildProcess();
  }
})();

async function executeAnyProcess() {
  //TODO: init from logger

  // init ClusterBus
  cbusConfig({
    requestTimeout: 10000,
    logDebug: logger.debug,
    logInfo: logger.info,
    logWarning: logger.warning,
    logError: logger.error
  });
}

async function executeMasterProcess() {
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
  
  // execute services
  //TODO
  await loadExporters<tServiceExporter>("./services/*/index.js", __dirname, " - LOAD: Services")
  .mapAsync(async serviceExport => {
    await serviceExport.init();
  });

  // Start child threads
  const cpuCount = require('os').cpus().length;
  for (var i = 0; i < cpuCount; i++) {
    const worker = cluster.fork();

    worker.on("disconnect", () => logger.info(`Worker '${worker.id}' disconnected!`));
    worker.on("exit", (code, signal) => logger.info(`Worker '${worker.id}' exiting with code '${code}' and signal '${signal}'!`));
    
    logger.info(`New Worker '${worker.id}' forked!`);
  }
}

async function executeChildProcess() {
  const app = new Koa();

  await loadExporters<tServiceExporter>("./services/*/index.js", __dirname, " - LOAD: Services")
  .mapAsync(async serviceExport => {
    await serviceExport.init();
  });

  await loadExporters<tConfigExporter>("./config/*.js", __dirname, " - LOAD: App Configurations")
  .mapAsync(async configExport => {
    await configExport.init(app);
  });

  await loadExporters<tAppRouteExporter>("./routes/*/index.js", __dirname, " - MOUNT: AppedRoutes")
  .mapAsync(async appExport => {
    app.use(Mount(appExport.route, appExport.app));
    
    await appExport.init(app);
  });

  
  // server config/handling
  const port = process.env.PORT || config.server.port || 3000;
  const server = app
  .listen(port, () => {
    logger.info(`Server on process [${workerId()}] running on port: '${port}'`);
  });

  // app.on("error", () => {});
  server.on("error", (err) => {
    logger.error("KOA ERROR HANDLER", err);
  });

  process.on("disconnect", () => {
    logger.error(` - disconnetting child process: [${workerId()}]`);

    server.close(function() {
      //TODO: dispose loaded entities
      //TODO: on app terminate execute dynamiclyloadedmodules dispose()

      process.exit(0);
    });
  });
}