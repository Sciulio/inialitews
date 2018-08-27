import Koa from "koa";

import compress from 'koa-compress';
import { tConfigExporter } from "../libs/types";


export default {
  order: 1000,
  init: async function (app: Koa) {
    app
    .use(compress({
      /*filter: function (content_type) {
        return /text/i.test(content_type)
      },*/
      threshold: 2048,
      flush: require('zlib').Z_SYNC_FLUSH
    }))
  }
} as tConfigExporter;