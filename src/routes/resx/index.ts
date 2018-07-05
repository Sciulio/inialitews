import fs from 'fs';
import path from 'path';
import http from 'http';
import { MultiTenantIncomingMessage, multitenantPath } from "../../libs/multitenant";
import { mimeType } from '../mime';


export function resxMiddleware(req: MultiTenantIncomingMessage, res: http.ServerResponse){
  const fullPath = multitenantPath(req);

  fs.exists(fullPath, function (exist) {
    //TODO use middlewares to send error pages
    if(!exist) {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end(`File ${fullPath} not found!`);
      return;
    }

    // read file from file system
    fs.readFile(fullPath, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(fullPath).ext;
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
        res.end(data);
      }
    });
  });
}