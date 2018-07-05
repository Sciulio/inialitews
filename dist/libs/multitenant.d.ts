/// <reference types="node" />
/// <reference types="connect" />
import http from 'http';
import { NextFunction } from 'connect';
export declare class MultiTenantIncomingMessage extends http.IncomingMessage {
    tenant: {
        staticPath: string;
    };
}
export declare function multitenantMiddleware(req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction): void;
export declare function multitenantPath(req: MultiTenantIncomingMessage): string;
