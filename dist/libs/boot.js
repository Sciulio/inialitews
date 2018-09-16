"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./env");
const logger_1 = require("./logger");
class AppLifecycleEmitter /*extends events*/ {
    constructor() {
        this.eventsHandlers = {};
        //super();
    }
    static get instance() {
        if (!AppLifecycleEmitter._instance) {
            if (env_1.isMasterProcess()) {
                AppLifecycleEmitter._instance = new MasterLifecycleEmitter();
            }
            else {
                AppLifecycleEmitter._instance = new WorkerLifecycleEmitter();
            }
        }
        return AppLifecycleEmitter._instance;
    }
    set onClosing(handler) {
        this.getHandlerBucket("onClosing").push(handler);
    }
    getHandlerBucket(event) {
        return this.eventsHandlers[event] || (this.eventsHandlers[event] = []);
    }
    emit(event, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getHandlerBucket(event)
                .forEachAsync(func => func(...args));
        });
    }
}
exports.AppLifecycleEmitter = AppLifecycleEmitter;
class MasterLifecycleEmitter extends AppLifecycleEmitter {
    init(bCtx) {
        return __awaiter(this, void 0, void 0, function* () {
            // process config/handling
            let isClosing = false;
            const onExit = () => __awaiter(this, void 0, void 0, function* () {
                if (isClosing) {
                    return;
                }
                isClosing = true;
                yield this.emit("onClosing");
                process.exit(0);
            });
            /*const onRestart = async () => {
              if (isClosing) {
                return;
              }
              isClosing = true;
              
              await this.emit("onClosing");
            };*/
            process
                .on('uncaughtException', (err) => {
                logger_1.logger.error("PROCESS ERROR HANDLER", err);
            })
                //.on('unhandledRejection', (err) => { ... })
                .on("beforeExit", onExit)
                .on("SIGINT", onExit)
                .on("SIGTERM", onExit);
        });
    }
}
class WorkerLifecycleEmitter extends AppLifecycleEmitter {
    init(bCtx) {
        return __awaiter(this, void 0, void 0, function* () {
            process
                .on('uncaughtException', (err) => {
                logger_1.logger.error("PROCESS ERROR HANDLER", err);
            })
                .on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
                logger_1.logger.error(` - disconnetting child process: [${env_1.workerId()}]`);
                yield this.emit("onClosing");
                process.exit(0);
            }));
        });
    }
}
exports.WorkerLifecycleEmitter = WorkerLifecycleEmitter;
//# sourceMappingURL=boot.js.map