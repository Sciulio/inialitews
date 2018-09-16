import path from 'path';

import { load } from 'dynamolo';

import Koa from 'koa';
import { logger } from './logger';


export type tBootstrappingModule = {
  init: () => Promise<void>;
};
export type tServiceExporter = tBootstrappingModule & {
  order: number;

  init: () => Promise<void>;
  dispose: () => Promise<void>;
};
export type tAppExporter = tServiceExporter & {
  init: (app: Koa) => Promise<void>;
};


export type tAppRouteExporter = tAppExporter & {
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

export function loadExporter<T extends tBootstrappingModule>(_path: string, infoMessage: string): T;
export function loadExporter<T extends tBootstrappingModule>(_path: string, infoMessage: string, rootPath: string): T;
export function loadExporter<T extends tBootstrappingModule>(...args: string[]): T {
  const _path = args[0];
  const infoMessage = args[1];
  const rootPath = args.length == 3 ? args[2] : appRoot;

  const absPath = path.join(rootPath, _path);

  logger.info(infoMessage);

  //TODO: check order collisions
  //TODO: exceptions handling? stop app?
  
  return load<T>(absPath, dynamoloCommonConfig)[0];
};

export function loadExporters<T extends tServiceExporter>(_path: string, infoMessage: string): T[];
export function loadExporters<T extends tServiceExporter>(_path: string, infoMessage: string, rootPath: string): T[];
export function loadExporters<T extends tServiceExporter>(...args: string[]): T[] {
  const _path = args[0];
  const infoMessage = args[1];
  const rootPath = args.length == 3 ? args[2] : appRoot;

  const absPath = path.join(rootPath, _path);

  logger.info(infoMessage);

  //TODO: check order collisions
  //TODO: exceptions handling? stop app?
  
  return load<T>(absPath, dynamoloCommonConfig)
  .sort((a, b) => a.order > b.order ? 1 : -1);
};

export async function disposeExporters(list: tServiceExporter[], infoMessage: string) {
  logger.info(infoMessage);

  await list
  .forEachAsync(async moduleExport => {
    await moduleExport.dispose();
  });
}