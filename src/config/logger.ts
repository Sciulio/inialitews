
import path from 'path';
import fs from 'fs';

import morgan from 'koa-morgan';

import { loadConfiguration } from '../libs/config';
import { tConfigExporter } from '../libs/exporters';


const config = loadConfiguration();

export default {
  order: 100,
  init: async function (app: any) {
    const logDirectory = path.join(process.cwd(), config.debug.logs.path);
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory); //TODO use mkdir???

    morgan
    .token('tenant', function (req, res) {
      return (res.getHeader("X-Tenant") || "").toString();
    })
    .token('requestId', function (req, res) {
      return (res as any).requestId;
    });

    /*
    app.use(morgan(':tenant :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { // 'combined'
      stream: rfs('access.log', {
        interval: '1d', // rotate daily
        path: logDirectory
      })
    }));
    */
  }
} as tConfigExporter;