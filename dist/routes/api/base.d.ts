import Router from 'koa-router';
export declare type tApiExport = {
    router: Router;
    route: string;
    init: () => Promise<void>;
    dispose: () => Promise<void>;
};
