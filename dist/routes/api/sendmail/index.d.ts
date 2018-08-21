/// <reference types="node" />
/// <reference types="koa-router" />
import Koa from 'koa';
import { IncomingMessage } from 'http';
type tEmail = string;
type tContent = string;
export interface ISendEmailData {
    gino: string;
}
export declare type tSendEmailData = ISendEmailData & {
    from: tEmail;
    to: tEmail;
    subject: string;
    body: tContent;
    on: Date;
};
export interface IRequestBodyParser {
    parse(req: IncomingMessage): ISendEmailData;
}
export declare module IRequestBodyParser {
    function instance(ver?: string): IRequestBodyParser;
    function version(req: IncomingMessage): string;
}
export declare function middleware(ctx: Koa.Context, next: () => Promise<any>): void;
declare const _default: (app: Koa) => void;
export default _default;
