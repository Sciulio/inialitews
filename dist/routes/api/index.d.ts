import { MultiTenantContext } from "../../libs/multitenant";
export declare function apiMiddleware(ctx: MultiTenantContext, next: () => Promise<any>): void;
