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
const koa_router_1 = __importDefault(require("koa-router"));
const storage_1 = require("./storage");
const routes_1 = __importDefault(require("./routes"));
const clustering_1 = require("../../../../libs/clustering");
const name = "sendmail";
const router = new koa_router_1.default();
exports.default = {
    name,
    router,
    route: "/" + name,
    init: () => __awaiter(this, void 0, void 0, function* () {
        if (!clustering_1.isMasterProcess()) {
            return;
        }
        yield storage_1.initDb(name);
        routes_1.default(router);
    }),
    dispose: () => __awaiter(this, void 0, void 0, function* () { })
};
//# sourceMappingURL=index.js.map