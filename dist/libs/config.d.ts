export declare type tConfig = {
    debug: {
        logs: {
            path: string;
        };
    };
    server: {
        port: number;
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
