import Koa from 'koa';
import { IncomingMessage } from 'http';


type tEmail = string;
type tContent = string;
export interface ISendEmailData {
  gino: string;
}
export type tSendEmailData = ISendEmailData & {
  from: tEmail;
  to: tEmail;
  subject: string;
  body: tContent;
  on: Date;
};

export interface IRequestBodyParser { // extends ISingletonService
  parse(req: IncomingMessage): ISendEmailData;
}
export module IRequestBodyParser {
  var _instance: IRequestBodyParser;

  export function instance(ver: string = 'last'): IRequestBodyParser {
    return _instance; //TODO:
  }
  export function version(req: IncomingMessage): string {
    return "last";
  }
}

export function middleware(ctx: Koa.Context, next: () => Promise<any>) {
  const version = IRequestBodyParser.version(ctx.req);
  const rbp = IRequestBodyParser.instance(version);

  const data = rbp.parse(ctx.req);

  //TODO: send data to sendmail service (IPC/nodejs cluster or other) with request uniqueId
  const broadcastingMessage = {
    //reqId: (ctx as MultiTenantContext).uniqueId,
    //threadId: cluster.id,
    //...,
    data
  };
  //TODO: save data to log/disk/db => better to do this by sendmail service. here will be logged the request (everyone with uniqueId)

  //async/await

  ctx.status = 200;
  ctx.type = ".json";
  ctx.body = {
    //error
    //DEBUG: stack
    message: "Mail sent!"
  };
}

export default (app: Koa) => {
  app.use(middleware);
};