export declare type tConfig = {
    debug: {
        logs: {
            path: string;
        };
    };
    target: {
        root: string;
    };
    tenants: {
        [domain: string]: {
            name: string;
        };
    };
};
export declare function loadConfiguration(): tConfig;
