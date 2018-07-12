/// <reference types="koa" />
/// <reference types="koa-router" />
import Koa from 'koa';
export declare function resxMiddleware(ctx: Koa.Context, next: () => Promise<any>): Promise<void>;
