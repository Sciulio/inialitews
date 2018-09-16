import fs from 'fs';
import path from 'path';
import cluster, { worker } from 'cluster'

import winston from 'winston';
const winstonDailyRotateFile = require('winston-daily-rotate-file');

import { loadConfiguration } from './config';
import { workerId, isProduction, processKey } from './env';


const config = loadConfiguration();
const _processKey = processKey();

const logDirectory = path.join(process.cwd(), config.stats.logs.path);
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory); //TODO use mkdir???


// - Write all logs error (and below) to `error.log`.
const errorTransport = new winstonDailyRotateFile({ // new winston.transports.File
  filename: path.join(logDirectory, `error-%DATE%_${_processKey}.log`),
  datePattern: 'YYYY-MM-DD', //YYYY-MM-DD-HH
  //zippedArchive: true,
  maxSize: '15m',
  maxFiles: '20d',
  level: 'error'
});
//errorTransport.on('rotate', function(oldFilename: string, newFilename: string) { ... });

// - Write to all logs with level `info` and below to `combined.log` 
const combinedTransport = new winstonDailyRotateFile({
  filename: path.join(logDirectory, `combined-%DATE%_${_processKey}.log`),
  datePattern: 'YYYY-MM-DD',
  //zippedArchive: true,
  maxSize: '30m',
  maxFiles: '20'
});

const accessTransport = new winstonDailyRotateFile({
  filename: path.join(logDirectory, `access-%DATE%_${_processKey}.log`),
  datePattern: 'YYYY-MM-DD',
  //zippedArchive: true,
  maxSize: '10m',
  maxFiles: '60'
});


export const logger = winston.createLogger({
  exitOnError: false,
  level: 'info',
  format: winston.format.simple(), //json(),
  transports: [
    errorTransport,
    combinedTransport
  ]
});

export const accessLogger = winston.createLogger({
  exitOnError: false,
  level: 'info',
  format: winston.format.simple(), //.printf(info => info.message),
  transports: [
    accessTransport
  ]
});

/*
if (isMasterProcess()) {
  cluster.on('message', function(worker, message) {
    if (message.label == "logging") {
      switch(message.type) {
        case "access": accessLogger.info.apply(accessLogger, message.args); break;
        case "error": logger.error.apply(accessLogger, message.args); break;
        //TODO:
      }
    }
  });
} else {
  const _logger: {[key: string]: (...args: any[]) => void} = {};

  ["access", "error"]
  .forEach(type => {
    _logger[type] = (...args: any[]) => {
      process.send && process.send({
        label: 'logging',
        type,
        args: (Array.from(arguments))
      })
    };
  })

  / *
  error
  warn: LeveledLogMethod;
  help: LeveledLogMethod;
  data: LeveledLogMethod;
  info: LeveledLogMethod;
  debug: LeveledLogMethod;
  prompt: LeveledLogMethod;
  http: LeveledLogMethod;
  verbose: LeveledLogMethod;
  input: LeveledLogMethod;
  silly: LeveledLogMethod;* /
}
*/

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (!isProduction()) {
  logger.add(new winston.transports.Console({
    //format: winston.format.simple()
    format: winston.format.printf(info => `(${_processKey}) ${info.message}`),
  }));
}