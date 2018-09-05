"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
const winstonCluster = require('winston-cluster');
const winstonDailyRotateFile = require('winston-daily-rotate-file');
const config_1 = require("./config");
const clustering_1 = require("./clustering");
const config = config_1.loadConfiguration();
const loggerTransports = [];
const accessLoggerTransports = [];
if (clustering_1.isMasterProcess()) {
    const logDirectory = path_1.default.join(process.cwd(), config.stats.logs.path);
    fs_1.default.existsSync(logDirectory) || fs_1.default.mkdirSync(logDirectory); //TODO use mkdir???
    // - Write all logs error (and below) to `error.log`.
    const errorTransport = new winstonDailyRotateFile({
        filename: path_1.default.join(logDirectory, 'error-' + clustering_1.processId() + '-%DATE%.log'),
        datePattern: 'YYYY-MM-DD-HH',
        //zippedArchive: true,
        maxSize: '15m',
        maxFiles: '20d',
        level: 'error'
    });
    //errorTransport.on('rotate', function(oldFilename: string, newFilename: string) { ... });
    // - Write to all logs with level `info` and below to `combined.log` 
    const combinedTransport = new winstonDailyRotateFile({
        filename: path_1.default.join(logDirectory, 'combined-' + clustering_1.processId() + '-%DATE%.log'),
        datePattern: 'YYYY-MM-DD-HH',
        //zippedArchive: true,
        maxSize: '30m',
        maxFiles: '20'
    });
    const accessTransport = new winstonDailyRotateFile({
        filename: path_1.default.join(logDirectory, 'access-' + clustering_1.processId() + '-%DATE%.log'),
        datePattern: 'YYYY-MM-DD-HH',
        //zippedArchive: true,
        maxSize: '10m',
        maxFiles: '60'
    });
    loggerTransports.push(errorTransport);
    loggerTransports.push(combinedTransport);
    accessLoggerTransports.push(accessTransport);
}
else {
    loggerTransports.push(new winstonCluster.Cluster({
        level: 'error'
    }));
    loggerTransports.push(new winstonCluster.Cluster({}));
    accessLoggerTransports.push(new winstonCluster.Cluster({}));
}
exports.logger = winston_1.default.createLogger({
    exitOnError: false,
    level: 'info',
    format: winston_1.default.format.json(),
    transports: loggerTransports
});
exports.accessLogger = winston_1.default.createLogger({
    exitOnError: false,
    level: 'info',
    format: winston_1.default.format.printf(info => info.message),
    transports: accessLoggerTransports
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
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple()
    }));
}
//# sourceMappingURL=logger.js.map