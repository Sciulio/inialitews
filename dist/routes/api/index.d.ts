/// <reference types="node" />
import http from 'http';
import { MultiTenantIncomingMessage } from "../../libs/multitenant";
export declare function apiMiddleware(req: MultiTenantIncomingMessage, res: http.ServerResponse): void;
