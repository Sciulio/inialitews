import path from 'path';

import { load } from 'dynamolo';

import Koa from 'koa';
import { logger } from './logger';


export type tConfigExporter = {
  order: number;
  
  init: (app: Koa) => Promise<void>;
  dispose: () => Promise<void>;
};

export type tServiceExporter = tConfigExporter & {
  init: () => Promise<void>;
};

export type tAppRouteExporter = tConfigExporter & {
  app: Koa;
  route: string;
};


const dynamoloCommonConfig = {
  exportDefault: true,
  //logInfo: (...args: any[]) => console.log("\x1b[35m", "INFO", ...args, "\x1b[0m"),
  //logError: (...args: any[]) => console.log("\x1b[31m", "ERROR", ...args, "\x1b[0m")
  logInfo: (...args: any[]) => logger.info(args.join("\t")),
  logError: (...args: any[]) => logger.error(args.join("\t"))
};

export function loadExporters<T>(_path: string, root: string, infoMessage: string): T[] {
  logger.info(infoMessage);

  //TODO: check order collisions
  //TODO: exceptions handling? stop app?
  
  return load<T>(path.join(root, _path), dynamoloCommonConfig)
  .sort((a, b) => a.order > b.order ? 1 : -1);
};