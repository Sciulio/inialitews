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
const koa_1 = __importDefault(require("koa"));
const shortid_1 = __importDefault(require("shortid"));
const dynamolo_1 = require("dynamolo");
const config_1 = require("../../libs/config");
const koa_morgan_1 = __importDefault(require("koa-morgan"));
const rfs = require('rotating-file-stream');
const config = config_1.loadConfiguration();
exports.app = new koa_1.default();
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        yield dynamolo_1.load(path_1.default.join(__dirname, "./*/index.js"), {
            exportDefault: true,
            logInfo: (...args) => console.log("\x1b[35m", "INFO", ...args, "\x1b[0m"),
            logError: (...args) => console.log("\x1b[31m", "ERROR", ...args, "\x1b[0m")
        })
            .forEachAsync((apiExport) => __awaiter(this, void 0, void 0, function* () {
            exports.app
                .use(apiExport.router.routes())
                .use(apiExport.router.allowedMethods());
            yield apiExport.init();
        }));
    });
}
exports.init = init;
exports.app.use(function (ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.res.requestId = ctx.requestId = shortid_1.default();
        yield next();
    });
});
const logDirectory = path_1.default.join(process.cwd(), config.debug.logs.path);
exports.app.use(koa_morgan_1.default(':tenant :requestId :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
    stream: rfs('access.log', {
        interval: '1d',
        path: logDirectory
    })
}));
//# sourceMappingURL=index.js.map