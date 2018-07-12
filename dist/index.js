"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_compress_1 = __importDefault(require("koa-compress"));
const koa_morgan_1 = __importDefault(require("koa-morgan"));
const rfs = require('rotating-file-stream');
const config_1 = require("./libs/config");
const multitenant_1 = require("./libs/multitenant");
const resx_1 = require("./routes/resx");
const config = config_1.loadConfiguration();
const app = new koa_1.default();
const router = new koa_router_1.default();
app.use(koa_compress_1.default({
    /*filter: function (content_type) {
      return /text/i.test(content_type)
    },*/
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}));
const logDirectory = path_1.default.join(process.cwd(), config.debug.logs.path);
fs_1.default.existsSync(logDirectory) || fs_1.default.mkdirSync(logDirectory); //TODO use mkdir???
koa_morgan_1.default.token('tenant', function (req, res) {
    return (res.getHeader("X-Tenant") || "").toString();
});
app.use(koa_morgan_1.default(':tenant :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
    stream: rfs('access.log', {
        interval: '1d',
        path: logDirectory
    })
}));
app.use(function (ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield next();
        }
        catch (err) {
            ctx.status = err.status || 500;
            let bodyMessage = null;
            if (ctx.status == 404) {
                bodyMessage = err.message || 'Page Not Found';
            }
            else {
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
    });
});
app.on('error', function (err) {
    if (process.env.NODE_ENV != 'test') {
        console.log('sent error %s to the cloud', err.message);
        console.log(err);
    }
});
// multitenancy
app.use(multitenant_1.multitenantMiddleware);
// respond to all requests
app.use(resx_1.resxMiddleware);
if (!module.parent) {
    app.listen(3000);
}
console.log('Server running on port 3000');
//# sourceMappingURL=index.js.map