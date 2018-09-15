import Koa from "koa";
import Mount from 'koa-mount';

import { tConfigExporter, loadExporters, tAppRouteExporter } from "../libs/exporters";


export default {
  order: 2010,
  init: async function (app: Koa) {
    await loadExporters<tAppRouteExporter>("./routes/*/index.js", " - MOUNT: AppedRoutes")
    .mapAsync(async appExport => {
      app.use(Mount(appExport.route, appExport.app));
      
      await appExport.init(app);
    });
  }
} as tConfigExporter;