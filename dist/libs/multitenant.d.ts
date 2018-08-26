/// <reference types="koa-router" />
import { tTenantConfig } from './config';
import Koa from 'koa';
export declare type MultiTenantContext = Koa.Context & {
    tenant: {
        locale: string;
        isDefaultLocale: boolean;
        cacheMaxAge: number;
        config: tTenantConfig;
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
