import fs from 'fs';
import path from 'path';

import winston from 'winston';
const winstonCluster = require('winston-cluster');
const winstonDailyRotateFile = require('winston-daily-rotate-file');

import { loadConfiguration } from './config';
import { isMasterProcess, processId } from './clustering';


const config = loadConfiguration();

const loggerTransports: winston.transports.Transports[] = [];
const accessLoggerTransports: winston.transports.Transports[] = [];

if (isMasterProcess()) {
  const logDirectory = path.join(process.cwd(), config.stats.logs.path);
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory); //TODO use mkdir???
  
  // - Write all logs error (and below) to `error.log`.
  const errorTransport = new winstonDailyRotateFile({ // new winston.transports.File
    filename: path.join(logDirectory, 'error-' + processId() + '-%DATE%.log'),
    datePattern: 'YYYY-MM-DD-HH',
    //zippedArchive: true,
    maxSize: '15m',
    maxFiles: '20d',
    level: 'error'
  });
  //errorTransport.on('rotate', function(oldFilename: string, newFilename: string) { ... });
  
  // - Write to all logs with level `info` and below to `combined.log` 
  const combinedTransport = new winstonDailyRotateFile({
    filename: path.join(logDirectory, 'combined-' + processId() + '-%DATE%.log'),
    datePattern: 'YYYY-MM-DD-HH',
    //zippedArchive: true,
    maxSize: '30m',
    maxFiles: '20'
  });
  
  const accessTransport = new winstonDailyRotateFile({
    filename: path.join(logDirectory, 'access-' + processId() + '-%DATE%.log'),
    datePattern: 'YYYY-MM-DD-HH',
    //zippedArchive: true,
    maxSize: '10m',
    maxFiles: '60'
  });

  loggerTransports.push(errorTransport);
  loggerTransports.push(combinedTransport);
  
  accessLoggerTransports.push(accessTransport);
} else {
  loggerTransports.push(new winstonCluster.Cluster({
    level: 'error'
  }));
  loggerTransports.push(new winstonCluster.Cluster({
  }));
  accessLoggerTransports.push(new winstonCluster.Cluster({
  }));
}

export const logger = winston.createLogger({
  exitOnError: false,
  level: 'info',
  format: winston.format.json(),
  transports: loggerTransports as any[]
});

export const accessLogger = winston.createLogger({
  exitOnError: false,
  level: 'info',
  format: winston.format.printf(info => info.message),
  transports: accessLoggerTransports as any[]
});

/*
if (isMasterProcess()) {
  winstonCluster.bindListeners(logger);
  winstonCluster.bindListeners(accessLogger);
}
*/

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}