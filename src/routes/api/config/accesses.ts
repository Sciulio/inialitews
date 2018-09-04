import path from 'path';

import Koa from 'koa';
import morgan from 'koa-morgan';
const rfs = require('rotating-file-stream');

import { tConfigExporter } from "../../../libs/exporters";
import { loadConfiguration } from '../../../libs/config';


const config = loadConfiguration();

export default {
  order: 100,
  init: async function(app: Koa) {
    const logDirectory = path.join(process.cwd(), config.stats.logs.path);
    
    app.use(morgan(':tenant :requestId :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { // 'combined'
      stream: rfs('access_apis.log', {
        interval: '1d', // rotate daily
        path: logDirectory
      })
    }));
  }
} as tConfigExporter;