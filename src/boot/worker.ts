import Koa from 'koa';

import { workerId } from '../libs/env';
import { loadConfiguration } from '../libs/config';

import { logger } from '../libs/logger';
import { AppLifecycleEmitter } from "../libs/boot";

import { loadExporters, tServiceExporter, tAppExporter, disposeExporters, tBootstrappingModule } from "../libs/exporters";


const config = loadConfiguration();

export default {
  init: async () => {
    // init services
    const servicesExported = await loadExporters<tServiceExporter>("./services/*/index.js", " - LOAD: Services")
    .mapAsync(async serviceExport => {
      await serviceExport.init();

      return serviceExport;
    });
    
    // server config/handling
    const port = process.env.PORT || config.server.port || 3000;
    const app = new Koa();

    const appExported = await loadExporters<tAppExporter>("./mwares/*.js", " - LOAD: App Configurations")
    .mapAsync(async configExport => {
      await configExport.init(app);

      return configExport;
    });
    
    const server = app
    .listen(port, () => {
      logger.info(`Server on process [${workerId()}] running on port: '${port}'`);
    })
    .on("error", (err) => {
      logger.error("KOA ERROR HANDLER", err);
    });
    // app.on("error", () => {});
    
    AppLifecycleEmitter.instance.onClosing = async () => {
      server.close(async function() {
        disposeExporters(servicesExported, "Disposing services!");
        
        disposeExporters(appExported, "Disposing app and routes!");
      });
    };
  }
} as tBootstrappingModule;