import { isMasterProcess, workerId } from './env';

import { logger } from './logger';


export type tBootContext = {
  moduleRoot: string;
  processRoot: string;
};

export abstract class AppLifecycleEmitter /*extends events*/ {
  // per-process static instance
  private static _instance: AppLifecycleEmitter;
  static get instance(): AppLifecycleEmitter {
    if (!AppLifecycleEmitter._instance) {
      if (isMasterProcess()) {
        AppLifecycleEmitter._instance = new MasterLifecycleEmitter();
      } else {
        AppLifecycleEmitter._instance = new WorkerLifecycleEmitter();
      }
    }
    return AppLifecycleEmitter._instance;
  }
  protected constructor() {
    //super();
  }

  abstract async init(bCtx: tBootContext): Promise<void>;

  protected eventsHandlers: {[event: string]: ((...args: any[]) => Promise<void>)[]} = {};
  
  set onClosing(handler: () => Promise<void>) {
    this.getHandlerBucket("onClosing").push(handler);
  }

  protected getHandlerBucket(event: string) {
    return this.eventsHandlers[event] || (this.eventsHandlers[event] = []);
  }

  async emit(event: string, ...args: any[]) {
    await this.getHandlerBucket(event)
    .forEachAsync(func => func(...args));
  }
}

class MasterLifecycleEmitter extends AppLifecycleEmitter {
  async init(bCtx: tBootContext): Promise<void> {
    // process config/handling

    let isClosing = false;
    const onExit = async () => {
      if (isClosing) {
        return;
      }
      isClosing = true;
      
      await this.emit("onClosing");

      process.exit(0);
    };
    /*const onRestart = async () => {
      if (isClosing) {
        return;
      }
      isClosing = true;
      
      await this.emit("onClosing");
    };*/

    process
    .on('uncaughtException', (err) => {
      logger.error("PROCESS ERROR HANDLER", err);
    })
    //.on('unhandledRejection', (err) => { ... })
    .on("beforeExit", onExit)
    .on("SIGINT", onExit)
    .on("SIGTERM", onExit)
    .on("SIGKILL", onExit)
    //.on("SIGHUP", onRestart)
    //.on("SIGUSR2", onRestart)
    ;
  }
}

export class WorkerLifecycleEmitter extends AppLifecycleEmitter {
  async init(bCtx: tBootContext): Promise<void> {
    process
    .on('uncaughtException', (err) => {
      logger.error("PROCESS ERROR HANDLER", err);
    })
    .on("disconnect", async () => {
      logger.error(` - disconnetting child process: [${workerId()}]`);
      
      await this.emit("onClosing");

      process.exit(0);
    });
  }
}