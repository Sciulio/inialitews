import cluster from 'cluster';

import { AppLifecycleEmitter } from "../libs/boot";
import { loadExporters, tServiceExporter, tBootstrappingModule, disposeExporters } from "../libs/exporters";

import { logger } from '../libs/logger';


export default {
  init: async () => {
    const threads: cluster.Worker[] = [];

    AppLifecycleEmitter.instance.onClosing = async function onExit() {
      if (isClosing) {
        return;
      }
      isClosing = true;

      disposeExporters(servicesExported, "Disposing services!");
    };
    let isClosing = false;
    
    // init services
    const servicesExported = await loadExporters<tServiceExporter>("./services/*/index.js", " - LOAD: Services")
    .mapAsync(async serviceExport => {
      await serviceExport.init();

      return serviceExport;
    });

    // Start child threads
    const cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i++) {
      const worker = cluster.fork();
      threads.push(worker);

      worker.on("disconnect", () => logger.info(`Worker '${worker.id}' disconnected!`));
      worker.on("exit", (code, signal) => logger.info(`Worker '${worker.id}' exiting with code '${code}' and signal '${signal}'!`));
      
      logger.info(`New Worker '${worker.id}' forked!`);
    }
  }
} as tBootstrappingModule;