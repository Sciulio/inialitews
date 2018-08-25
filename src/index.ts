import path from 'path';
import fs from 'fs';

import { loadConfiguration } from './libs/config';

import Koa from 'koa';
import Mount from 'koa-mount';
import compress from 'koa-compress';

import morgan from 'koa-morgan';
const rfs = require('rotating-file-stream');

import { multitenantMiddleware } from './libs/multitenant';
import { initDb } from './libs/audit';

import { app as resxApp, init as resxInit } from './routes/resx';
import { app as routerApp, init as routerInit } from './routes/api';


const config = loadConfiguration();

const app = new Koa();


// log configuration

const logDirectory = path.join(process.cwd(), config.debug.logs.path);
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory); //TODO use mkdir???

morgan.token('tenant', function (req, res) {
  return (res.getHeader("X-Tenant") || "").toString();
});
morgan.token('requestId', function (req, res) {
  return (res as any).requestId;
});
/*
app.use(morgan(':tenant :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { // 'combined'
  stream: rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
  })
}));
*/


// webserver configuration

app
.use(compress({
  /*filter: function (content_type) {
  	return /text/i.test(content_type)
  },*/
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))
.use(async function(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;

    let bodyMessage = null;
    if (ctx.status == 404) {
      bodyMessage = err.message || 'Page Not Found';
    } else {
      bodyMessage = err.message || "Something exploded!!!";
    }

    switch (ctx.accepts('html', 'json')) {
      case 'html':
        ctx.type = 'html';
        ctx.body = `<h2>${ctx.status}</h2><p>${bodyMessage}</p>`;
        break;
      case 'json':
        ctx.type = 'json';
        ctx.body = {
          message: bodyMessage,
          error: bodyMessage
        };
        break;
      default:
        ctx.type = 'text';
        ctx.body = bodyMessage;
    }
    
    // since we handled this manually we'll want to delegate to the regular app
    // level error handling as well so that centralized still functions correctly.
    ctx.app.emit('error', err, ctx);
  }
})
.on('error', function(err) {
  if (process.env.NODE_ENV != 'test') {
    console.log('sent error %s to the cloud', err.message);
    console.log(err);
  }
});

// multitenancy
app.use(multitenantMiddleware);

app.use(Mount("/_api", routerApp));
app.use(Mount("/", resxApp));


// init execution

(async function() {
  await initDb();

  await routerInit();
  await resxInit();

  if (!module.parent) {
    const server = app
    .listen(config.server.port, () => {
      console.log('Server running on port:', config.server.port);
    });
  }
})();