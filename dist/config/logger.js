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
const koa_morgan_1 = __importDefault(require("koa-morgan"));
const config_1 = require("../libs/config");
const config = config_1.loadConfiguration();
exports.default = {
    order: 100,
    init: function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            const logDirectory = path_1.default.join(process.cwd(), config.debug.logs.path);
            fs_1.default.existsSync(logDirectory) || fs_1.default.mkdirSync(logDirectory); //TODO use mkdir???
            koa_morgan_1.default
                .token('tenant', function (req, res) {
                return (res.getHeader("X-Tenant") || "").toString();
            })
                .token('requestId', function (req, res) {
                return res.requestId;
            });
            /*
            app.use(morgan(':tenant :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { // 'combined'
              stream: rfs('access.log', {
                interval: '1d', // rotate daily
                path: logDirectory
              })
            }));
            */
        });
    }
};
//# sourceMappingURL=logger.js.map