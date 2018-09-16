import Router from 'koa-router';
import { tAppExporter } from '../../../libs/exporters';


export type tApiExport = tAppExporter & {
  name: string;
  
  router: Router;
  route: string;
  
  init: () => Promise<void>;
  //dispose: () => Promise<void>;
}