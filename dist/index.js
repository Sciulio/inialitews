"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const connect_1 = __importDefault(require("connect"));
const multitenant_1 = require("./libs/multitenant");
const index_1 = require("./routes/api/index");
const index_2 = require("./routes/resx/index");
const config_1 = require("./libs/config");
const morgan_1 = __importDefault(require("morgan"));
const rfs = require('rotating-file-stream');
const compression_1 = __importDefault(require("compression"));
const config = config_1.loadConfiguration();
const app = connect_1.default();
const logDirectory = path_1.default.join(process.cwd(), config.debug.logs.path);
fs_1.default.existsSync(logDirectory) || fs_1.default.mkdirSync(logDirectory); //TODO use mkdir???
//TODO: set log info for tenant?
app.use(morgan_1.default('combined', {
    stream: rfs('access.log', {
        interval: '1d',
        path: logDirectory
    })
}));
// compress all responses
app.use(compression_1.default());
// respond to all requests
app.use(multitenant_1.multitenantMiddleware);
// respond to all requests
app.use("/api", index_1.apiMiddleware);
// respond to all requests
app.use(index_2.resxMiddleware);
//create node.js http server and listen on port
http_1.default.createServer(app).listen(3000);
//# sourceMappingURL=index.js.map