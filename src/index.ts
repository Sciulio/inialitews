import http from 'http';
import path from 'path';
import fs from 'fs';
import connect from 'connect';
import { multitenantMiddleware } from './libs/multitenant';
import { apiMiddleware } from './routes/api/index';
import { resxMiddleware } from './routes/resx/index';
import { loadConfiguration } from './libs/config';
import morgan from 'morgan';
const rfs = require('rotating-file-stream');
import compression from 'compression';


const config = loadConfiguration();
const app = connect();

const logDirectory = path.join(process.cwd(), config.debug.logs.path);
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory); //TODO use mkdir???

//TODO: set log info for tenant?
app.use(morgan('combined', {
  stream: rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
  })
}) as connect.HandleFunction);

// compress all responses
app.use(compression() as connect.HandleFunction)

// respond to all requests
app.use(multitenantMiddleware as connect.HandleFunction);

// respond to all requests
app.use("/api", apiMiddleware as connect.HandleFunction);

// respond to all requests
app.use(resxMiddleware as connect.HandleFunction);

//create node.js http server and listen on port
http.createServer(app).listen(3000);