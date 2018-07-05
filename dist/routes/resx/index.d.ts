/// <reference types="node" />
import http from 'http';
import { MultiTenantIncomingMessage } from "../../libs/multitenant";
export declare function resxMiddleware(req: MultiTenantIncomingMessage, res: http.ServerResponse): void;
