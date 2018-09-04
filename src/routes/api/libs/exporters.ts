import Router from 'koa-router';
import { tConfigExporter } from '../../../libs/exporters';


export type tApiExport = tConfigExporter & {
  name: string;
  
  router: Router;
  route: string;
  
  init: () => Promise<void>;
  //dispose: () => Promise<void>;
}