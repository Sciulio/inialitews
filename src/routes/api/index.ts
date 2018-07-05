import http from 'http';
import { mimeType } from "../mime";
import { MultiTenantIncomingMessage } from "../../libs/multitenant";


export function apiMiddleware(req: MultiTenantIncomingMessage, res: http.ServerResponse){
  res.end({
      data: req.tenant.staticPath + ".bella"
    },
    mimeType[".json"]
  );
}