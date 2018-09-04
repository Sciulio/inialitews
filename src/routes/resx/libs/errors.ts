import Koa from 'koa';


export function error404(ctx: Koa.Context) {
  ctx.status = 404;
  //TODO: load 404 page
  ctx.body = "ERROREE 404!";
}