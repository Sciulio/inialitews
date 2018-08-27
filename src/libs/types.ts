import Koa from 'koa';


export type tConfigExporter = {
  order: number;
  init: (app: Koa) => Promise<void>;
};

export type tServiceExporter = tConfigExporter;

export type tAppRouteExporter = tConfigExporter & {
  app: Koa;
  route: string;
};