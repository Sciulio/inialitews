"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
const winstonDailyRotateFile = require('winston-daily-rotate-file');
const config_1 = require("./config");
const clustering_1 = require("./clustering");
const config = config_1.loadConfiguration();
const _processKey = clustering_1.processKey();
const logDirectory = path_1.default.join(process.cwd(), config.stats.logs.path);
fs_1.default.existsSync(logDirectory) || fs_1.default.mkdirSync(logDirectory); //TODO use mkdir???
// - Write all logs error (and below) to `error.log`.
const errorTransport = new winstonDailyRotateFile({
    filename: path_1.default.join(logDirectory, `error-%DATE%_${_processKey}.log`),
    datePattern: 'YYYY-MM-DD',
    //zippedArchive: true,
    maxSize: '15m',
    maxFiles: '20d',
    level: 'error'
});
//errorTransport.on('rotate', function(oldFilename: string, newFilename: string) { ... });
// - Write to all logs with level `info` and below to `combined.log` 
const combinedTransport = new winstonDailyRotateFile({
    filename: path_1.default.join(logDirectory, `combined-%DATE%_${_processKey}.log`),
    datePattern: 'YYYY-MM-DD',
    //zippedArchive: true,
    maxSize: '30m',
    maxFiles: '20'
});
const accessTransport = new winstonDailyRotateFile({
    filename: path_1.default.join(logDirectory, `access-%DATE%_${_processKey}.log`),
    datePattern: 'YYYY-MM-DD',
    //zippedArchive: true,
    maxSize: '10m',
    maxFiles: '60'
});
exports.logger = winston_1.default.createLogger({
    exitOnError: false,
    level: 'info',
    format: winston_1.default.format.json(),
    transports: [
        errorTransport,
        combinedTransport
    ]
});
exports.accessLogger = winston_1.default.createLogger({
    exitOnError: false,
    level: 'info',
    format: winston_1.default.format.simple(),
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
if (!clustering_1.isProduction()) {
    exports.logger.add(new winston_1.default.transports.Console({
        //format: winston.format.simple()
        format: winston_1.default.format.printf(info => `(${_processKey}) ${info.message}`),
    }));
}
//# sourceMappingURL=logger.js.map