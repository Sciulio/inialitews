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

let appRoot: string = "";

export function config(_appRoot: string) {
  appRoot = _appRoot;
}

export function loadExporters<T extends tConfigExporter>(_path: string, infoMessage: string): T[];
export function loadExporters<T extends tConfigExporter>(_path: string, infoMessage: string, rootPath: string): T[];
export function loadExporters<T extends tConfigExporter>(...args: string[]): T[] {
  const _path = args[0];
  const infoMessage = args[1];
  const rootPath = args.length == 3 ? args[2] : appRoot;

  logger.info(infoMessage);

  //TODO: check order collisions
  //TODO: exceptions handling? stop app?
  
  const absPath = path.join(rootPath, _path);
  
  return load<T>(absPath, dynamoloCommonConfig)
  .sort((a, b) => a.order > b.order ? 1 : -1);
};