import Koa from 'koa';
export declare type tConfigExporter = {
    order: number;
    init: (app: Koa) => Promise<void>;
    dispose: () => Promise<void>;
};
export declare type tServiceExporter = tConfigExporter;
export declare type tAppRouteExporter = tConfigExporter & {
    app: Koa;
    route: string;
};
export declare function loadExporters<T>(_path: string, root: string, infoMessage: string): T[];
