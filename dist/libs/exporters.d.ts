import Koa from 'koa';
export declare type tConfigExporter = {
    order: number;
    init: (app: Koa) => Promise<void>;
    dispose: () => Promise<void>;
};
export declare type tServiceExporter = tConfigExporter & {
    init: () => Promise<void>;
};
export declare type tAppRouteExporter = tConfigExporter & {
    app: Koa;
    route: string;
};
export declare function config(_appRoot: string): void;
export declare function loadExporters<T>(_path: string, infoMessage: string): T[];
export declare function loadExporters<T>(_path: string, infoMessage: string, rootPath: string): T[];
