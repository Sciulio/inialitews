import Koa from "koa";

import { tConfigExporter } from "../libs/types";


export default {
  order: 3000,
  init: async function (app: Koa) {
    app
    .on('error', function(err) {
      if (process.env.NODE_ENV != 'test') {
        console.log('sent error %s to the cloud', err.message);
        console.log(err);
      }
    });
  }
} as tConfigExporter;