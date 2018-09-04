import path from 'path';

import winston from 'winston';
const winstonDailyRotateFile = require('winston-daily-rotate-file');

import { loadConfiguration } from './config';


const config = loadConfiguration();
const logDirectory = path.join(process.cwd(), config.stats.logs.path);

// - Write all logs error (and below) to `error.log`.
const errorTransport = new winstonDailyRotateFile({ // new winston.transports.File
  filename: path.join(logDirectory, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD-HH',
  //zippedArchive: true,
  maxSize: '15m',
  maxFiles: '20d',
  level: 'error'
});
//errorTransport.on('rotate', function(oldFilename: string, newFilename: string) { ... });

// - Write to all logs with level `info` and below to `combined.log` 
const combinedTransport = new winstonDailyRotateFile({
  filename: path.join(logDirectory, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD-HH',
  //zippedArchive: true,
  maxSize: '30m',
  maxFiles: '20'
});

export const logger = winston.createLogger({
  exitOnError: false,
  level: 'info',
  format: winston.format.json(),
  transports: [
    errorTransport,
    combinedTransport
  ]
});
 
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}