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
const env_1 = require("./env");
let _requestTimeout = 0;
let _logDebug = console.debug;
let _logInfo = console.log;
let _logWarning = console.warn;
let _logError = console.error;
function config(options) {
    _requestTimeout = options.requestTimeout || 0;
    _logDebug = options.logDebug || _logDebug;
    _logInfo = options.logInfo || _logInfo;
    _logWarning = options.logWarning || _logWarning;
    _logError = options.logError || _logError;
}
exports.config = config;
/*export let requestMaster:
  (<T>(channelLabel: string, data: any) => Promise<T>)|
  (<T>(channelLabel: string, data: any, cback: tResponseResolver<T>) => void)
;*/
const _ERROR_channelNotFound = 400;
const _ERROR_channelExecutorThrown = 500;
const _ERROR_channelTimeout = 600;
if (env_1.isMasterProcess()) {
    const registeredChannels = {};
    cluster_1.default.addListener("message", (worker, message, handle) => __awaiter(this, void 0, void 0, function* () {
        _logDebug(`ClusterBus::message from worker ${worker.id} with message ${JSON.stringify(message)}`);
        if ("transactionId" in message) {
            const transactionId = message.transactionId;
            const channelLabel = message.channelLabel;
            const channelWrapper = registeredChannels[channelLabel];
            const toSendObj = {
                transactionId
            };
            if (channelWrapper) {
                _logInfo(`ClusterBus::Channel '${channelLabel}' called within transaction '${transactionId}'`);
                const executor = channelWrapper.context ?
                    channelWrapper.func.bind(channelWrapper.context) :
                    channelWrapper.func;
                try {
                    toSendObj.data = yield executor(message.data);
                }
                catch (err) {
                    _logError(err);
                    toSendObj.error = _ERROR_channelExecutorThrown;
                    toSendObj.data = err;
                }
            }
            else {
                _logWarning(`ClusterBus::Channel labeled '${channelLabel}' called but not actually registered!`);
                toSendObj.error = _ERROR_channelNotFound;
            }
            worker.send(toSendObj);
        }
    }));
    exports.subscribeReqResChannel = function (channelLabel, executor, context) {
        if (channelLabel in registeredChannels) {
            throw new Error("Already registered channel: " + channelLabel);
        }
        _logInfo(`ClusterBus::Registering '${channelLabel}' channel!`);
        registeredChannels[channelLabel] = {
            func: executor,
            context
        };
    };
}
else {
    const transactionSet = {};
    //TODO: sendHandle?
    exports.requestMaster = function (channelLabel, data, cbackRecolver) {
        //TODO: manage collisions????
        const transactionId = Math.random().toString();
        _logDebug(`ClusterBus::sendTransaction '${transactionId}' on channel '${channelLabel}' with data ${JSON.stringify(data)}`);
        //_logInfo(`ClusterBus::sendTransaction "${transactionId}" on channel "${channelLabel}"`);
        setImmediate(() => process.send && process.send({
            channelLabel,
            transactionId,
            data
        }));
        const transactionWrapper = transactionSet[transactionId] = {
            resolver: null
        };
        if (_requestTimeout > 0) {
            transactionWrapper.timer = setTimeout(() => {
                _logWarning(`ClusterBus::sendTransaction '${transactionId}' on channel '${channelLabel}' timedout after ${_requestTimeout}[ms]!`);
                delete transactionSet[transactionId];
            }, _requestTimeout);
        }
        if (cbackRecolver) {
            transactionWrapper.resolver = cbackRecolver;
        }
        else {
            return new Promise((res, rej) => {
                transactionWrapper.resolver = res;
            });
        }
    };
    process.on("message", (args) => {
        _logDebug(`ClusterBus::sendTransaction => on message: ${JSON.stringify(args)}`);
        if ("transactionId" in args) {
            const transactionId = args.transactionId;
            if (!(transactionId in transactionSet)) {
                _logWarning(`ClusterBus::Received not registered transaction '${transactionId}' (maybe timedout)!`);
                return;
            }
            const transactionWrapper = transactionSet[transactionId];
            delete transactionSet[transactionId];
            if (transactionWrapper.timer) {
                clearTimeout(transactionWrapper.timer);
            }
            if ("error" in args) {
                //_logWarning()
                return;
            }
            // async function not awaited???
            transactionWrapper.resolver(args.data);
        }
    });
}
//# sourceMappingURL=clusterbus.js.map