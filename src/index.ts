import "async-extensions";

import { isMasterProcess } from "./libs/env";

import { logger } from "./libs/logger";

import { config as expConfig, tBootstrappingModule, loadExporter } from './libs/exporters';
import { config as cbusConfig } from "./libs/clusterbus";
import { AppLifecycleEmitter } from "./libs/boot";


export async function init() {
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

  await AppLifecycleEmitter.instance.init({
    moduleRoot: __dirname,
    processRoot: process.cwd()
  });
  
  (await loadExporter<tBootstrappingModule>(
    isMasterProcess() ? "./boot/master.js" : "./boot/worker.js",
    "Bootstrapping module!"
  ))
  .init();
};