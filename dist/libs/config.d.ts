export declare type tConfig = {
    debug: {
        logs: {
            path: string;
        };
    };
    server: {
        port: number;
    };
    services: {
        db: {
            path: string;
        };
        apis: {
            [name: string]: any;
        };
    };
    target: {
        root: string;
    };
    tenants: {
        [domain: string]: {
            name: string;
            locale: string[];
            cacheMaxAge: number;
        };
    };
};
export declare function loadConfiguration(): tConfig;
