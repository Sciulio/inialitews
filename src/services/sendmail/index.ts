import { initDb } from './storage';

import { tApiExport } from '../../routes/api/libs/exporters';


const apiKey = "sendmail";

export default {
  order: 1000,
  init: async () => {
    await initDb(apiKey);
  },
  dispose: async () => {}
} as tApiExport;