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
const koa_mount_1 = __importDefault(require("koa-mount"));
const exporters_1 = require("../libs/exporters");
exports.default = {
    order: 2010,
    init: function (app) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exporters_1.loadExporters("./routes/*/index.js", " - MOUNT: AppedRoutes")
                .mapAsync((appExport) => __awaiter(this, void 0, void 0, function* () {
                app.use(koa_mount_1.default(appExport.route, appExport.app));
                yield appExport.init(app);
            }));
        });
    }
};
//# sourceMappingURL=routes.js.map