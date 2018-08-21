/// <reference types="koa-router" />
import Koa from 'koa';
export declare type MultiTenantContext = Koa.Context & {
    tenant: {
        staticPath: string;
        locale: string;
        isDefaultLocale: boolean;
        cacheMaxAge: number;
    };
};
export declare type MultiTenantResxContext = MultiTenantContext & {
    resx: {
        absPath: string;
        relPath: string;
        ext: string;
        isLocalizable: boolean;
    };
};
export declare function multitenantMiddleware(ctx: Koa.Context, next: () => Promise<any>): Promise<void>;
export declare function multitenantPath(ctx: MultiTenantContext): string[];
