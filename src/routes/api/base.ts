import Router from 'koa-router';


export type tApiExport = {
  router: Router;
  route: string;
  
  init: () => Promise<void>;
  dispose: () => Promise<void>;
}