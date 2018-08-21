"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IRequestBodyParser;
(function (IRequestBodyParser) {
    var _instance;
    function instance(ver = 'last') {
        return _instance; //TODO:
    }
    IRequestBodyParser.instance = instance;
    function version(req) {
        return "last";
    }
    IRequestBodyParser.version = version;
})(IRequestBodyParser = exports.IRequestBodyParser || (exports.IRequestBodyParser = {}));
function middleware(ctx, next) {
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
exports.middleware = middleware;
exports.default = (app) => {
    app.use(middleware);
};
//# sourceMappingURL=index.js.map