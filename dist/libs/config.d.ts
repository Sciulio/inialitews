export declare type tApiConfig = {
    name: string;
    options: any;
};
export declare type tTenantConfig = {
    name: string;
    locale: string[];
    cacheMaxAge: number;
    apis: tApiConfig[];
};
export declare type tConfig = {
    stats: {
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
            [name: string]: tApiConfig;
        };
    };
    target: {
        root: string;
    };
    tenants: {
        [domain: string]: tTenantConfig;
    };
};
export declare function loadConfiguration(): tConfig;
