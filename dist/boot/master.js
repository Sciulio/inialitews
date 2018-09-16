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
const cluster_1 = __importDefault(require("cluster"));
const boot_1 = require("../libs/boot");
const exporters_1 = require("../libs/exporters");
const logger_1 = require("../libs/logger");
exports.default = {
    init: () => __awaiter(this, void 0, void 0, function* () {
        const threads = [];
        boot_1.AppLifecycleEmitter.instance.onClosing = function onExit() {
            return __awaiter(this, void 0, void 0, function* () {
                if (isClosing) {
                    return;
                }
                isClosing = true;
                exporters_1.disposeExporters(servicesExported, "Disposing services!");
            });
        };
        let isClosing = false;
        // init services
        const servicesExported = yield exporters_1.loadExporters("./services/*/index.js", " - LOAD: Services")
            .mapAsync((serviceExport) => __awaiter(this, void 0, void 0, function* () {
            yield serviceExport.init();
            return serviceExport;
        }));
        // Start child threads
        const cpuCount = require('os').cpus().length;
        for (var i = 0; i < cpuCount; i++) {
            const worker = cluster_1.default.fork();
            threads.push(worker);
            worker.on("disconnect", () => logger_1.logger.info(`Worker '${worker.id}' disconnected!`));
            worker.on("exit", (code, signal) => logger_1.logger.info(`Worker '${worker.id}' exiting with code '${code}' and signal '${signal}'!`));
            logger_1.logger.info(`New Worker '${worker.id}' forked!`);
        }
    })
};
//# sourceMappingURL=master.js.map