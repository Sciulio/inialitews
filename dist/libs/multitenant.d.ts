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
export declare type MultiTenantApiContext = MultiTenantContext & {
    api: {
        requestId: string;
    };
};
export declare function multitenantStrategy(ctx: Koa.Context): tTenantConfig;
export declare function multitenantPath(ctx: MultiTenantContext): string[];
