export declare type tBootContext = {
    moduleRoot: string;
    processRoot: string;
};
export declare abstract class AppLifecycleEmitter {
    private static _instance;
    static readonly instance: AppLifecycleEmitter;
    protected constructor();
    abstract init(bCtx: tBootContext): Promise<void>;
    protected eventsHandlers: {
        [event: string]: ((...args: any[]) => Promise<void>)[];
    };
    onClosing: () => Promise<void>;
    protected getHandlerBucket(event: string): ((...args: any[]) => Promise<void>)[];
    emit(event: string, ...args: any[]): Promise<void>;
}
export declare class WorkerLifecycleEmitter extends AppLifecycleEmitter {
    init(bCtx: tBootContext): Promise<void>;
}
