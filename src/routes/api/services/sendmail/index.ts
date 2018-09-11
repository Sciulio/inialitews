import Router from 'koa-router';

import { tApiExport } from '../../libs/exporters';
import { initDb } from './storage';

import init from './routes';
import { isMasterProcess } from '../../../../libs/clustering';


const name = "sendmail";
const router = new Router();

export default {
  name,
  router,
  route: "/" + name,
  init: async () => {
    if (!isMasterProcess()) {
      return;
    }
    
    await initDb(name);

    init(router);
  },
  dispose: async () => {}
} as tApiExport;