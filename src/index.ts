import "async-extensions";
import cluster from 'cluster';

import Koa from 'koa';

import { logger } from "./libs/logger";

import { loadConfiguration } from './libs/config';

import { config as expConfig, tConfigExporter, tServiceExporter, loadExporters } from './libs/exporters';
import { isMasterProcess, workerId, isProduction, isPm2Managed } from "./libs/workers";
import { config as cbusConfig } from "./libs/clusterbus";


const config = loadConfiguration();

//setTimeout(init,5000);
init();

async function init() {
  configLibs();

  if (isProduction()) {
    if (isMasterProcess()) {
      await processErrorSignaling();
      await initServices();
  
      if (!isPm2Managed()) {
        forkWorkers();
      }
    } else {
      await initServices();
      await initMiddlewares();
    }
  } else {
    await processErrorSignaling();
    await initServices();
    await initMiddlewares();
  }
};

function forkWorkers() {
  // Start child threads
  const cpuCount = require('os').cpus().length;
  for (var i = 0; i < cpuCount; i++) {
    const worker = cluster.fork();

    worker.on("disconnect", () => logger.info(`Worker '${worker.id}' disconnected!`));
    worker.on("exit", (code, signal) => logger.info(`Worker '${worker.id}' exiting with code '${code}' and signal '${signal}'!`));
    
    logger.info(`New Worker '${worker.id}' forked!`);
  }
}

async function processErrorSignaling() {
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
}

async function configLibs() {
  //TODO: init from logger

  // init loadexports
  expConfig(__dirname);

  // init ClusterBus
  cbusConfig({
    requestTimeout: 10000,
    logDebug: logger.debug,
    logInfo: logger.info,
    logWarning: logger.warning,
    logError: logger.error
  });
}

async function initServices() {
  await loadExporters<tServiceExporter>("./services/*/index.js", " - LOAD: Services")
  .mapAsync(async serviceExport => {
    await serviceExport.init();
  });
}

async function initMiddlewares() {
  const app = new Koa();

  await loadExporters<tConfigExporter>("./mwares/*.js", " - LOAD: App Configurations")
  .mapAsync(async configExport => {
    await configExport.init(app);
  });
 
  // server config/handling
  const port = process.env.PORT || config.server.port || 3000;
  const server = app
  .listen(port, () => {
    logger.info(`Server on process [${workerId()}] running on port: '${port}'`);
  })
  .on("error", (err) => {
    logger.error("KOA ERROR HANDLER", err);
  });
  // app.on("error", () => {});

  process.on("disconnect", () => {
    logger.error(` - disconnetting child process: [${workerId()}]`);

    server.close(function() {
      //TODO: dispose loaded entities
      //TODO: on app terminate execute dynamiclyloadedmodules dispose()

      process.exit(0);
    });
  });
}