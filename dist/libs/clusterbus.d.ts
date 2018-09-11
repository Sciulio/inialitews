declare type tRequestHandler<T> = (data: T) => (any | Promise<any>);
declare type tResponseResolver<T> = (data: T) => void;
export declare function config(options: {
    requestTimeout?: number;
    logDebug?: (...args: any[]) => void;
    logInfo?: (...args: any[]) => void;
    logWarning?: (...args: any[]) => void;
    logError?: (...args: any[]) => void;
}): void;
export declare let subscribeReqResChannel: <T>(queueLabel: string, executor: tRequestHandler<T>, context?: any) => void;
export declare let requestMaster: <T>(queueLabel: string, data: any, cback?: tResponseResolver<T>) => void | Promise<T>;
export {};
