import { MultiTenantContext } from "../../libs/multitenant";


export function apiMiddleware(ctx: MultiTenantContext, next: () => Promise<any>){
  ctx.status = 200;
  ctx.type = ".json";
  ctx.body = ctx.tenant.staticPath;
}