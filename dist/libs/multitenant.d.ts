import Koa from 'koa';
import Router from 'koa-router';
import { tTenantConfig } from './config';
export declare type MultiTenantContext = Koa.Context & {
    tenant: {
        name: string;
        locale: string;
        isDefaultLocale: boolean;
        cacheMaxAge: number;
    };
    access: {
        requestOn: number;
    };
};
export declare type MultiTenantResxContext = MultiTenantContext & Router.IRouterContext & {
    resx: {
        absPath: string;
        relPath: string;
        ext: string;
        isLocalizable: boolean;
    };
};
export declare type MultiTenantApiContext = MultiTenantContext & Router.IRouterContext & {
    api: {
        requestId: string;
        name?: string;
        config?: any;
    };
};
export declare function multitenantStrategy(ctx: Koa.Context): tTenantConfig;
export declare function multitenantPath(ctx: MultiTenantContext): string[];
export declare function getApiConfig(tenantName: string, apiName: string): any;
