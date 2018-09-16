import Koa from 'koa';
export declare type tBootstrappingModule = {
    init: () => Promise<void>;
};
export declare type tServiceExporter = tBootstrappingModule & {
    order: number;
    init: () => Promise<void>;
    dispose: () => Promise<void>;
};
export declare type tAppExporter = tServiceExporter & {
    init: (app: Koa) => Promise<void>;
};
export declare type tAppRouteExporter = tAppExporter & {
    app: Koa;
    route: string;
};
export declare function config(_appRoot: string): void;
export declare function loadExporter<T extends tBootstrappingModule>(_path: string, infoMessage: string): T;
export declare function loadExporter<T extends tBootstrappingModule>(_path: string, infoMessage: string, rootPath: string): T;
export declare function loadExporters<T extends tServiceExporter>(_path: string, infoMessage: string): T[];
export declare function loadExporters<T extends tServiceExporter>(_path: string, infoMessage: string, rootPath: string): T[];
export declare function disposeExporters(list: tServiceExporter[], infoMessage: string): Promise<void>;
