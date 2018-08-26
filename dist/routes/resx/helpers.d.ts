/// <reference types="koa-router" />
import Koa from 'koa';
import { MultiTenantResxContext } from "../../libs/multitenant";
export declare function checkForEffectivePath(ctx: MultiTenantResxContext): Promise<string | null>;
export declare function error404(ctx: Koa.Context): void;
