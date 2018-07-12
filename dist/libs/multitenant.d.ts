/// <reference types="koa" />
/// <reference types="koa-router" />
import Koa from 'koa';
export declare type MultiTenantContext = Koa.Context & {
    tenant: {
        staticPath: string;
    };
};
export declare function multitenantMiddleware(ctx: Koa.Context, next: () => Promise<any>): Promise<void>;
export declare function multitenantRelPath(ctx: MultiTenantContext): string;
