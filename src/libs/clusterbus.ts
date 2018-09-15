import cluster from "cluster";
import { isMasterProcess } from "./workers";


type tRequestArgs = {
  channelLabel: string;
  transactionId: string;
  data: any;
};
type tResponseArgs = {
  transactionId: string;
  data: any;
};
type tResponseThrownArgs = {
  transactionId: string;
  error: any;
  data: any;
};

type tRequestHandler<T> = (data: T) => (any | Promise<any>);
type tResponseResolver<T> = (data: T) => void;


let _requestTimeout = 0;
let _logDebug = console.debug;
let _logInfo = console.log;
let _logWarning = console.warn;
let _logError = console.error;

export function config(options: {
  requestTimeout?: number;
  logDebug?: (...args: any[]) => void;
  logInfo?: (...args: any[]) => void;
  logWarning?: (...args: any[]) => void;
  logError?: (...args: any[]) => void;
}) {
  _requestTimeout = options.requestTimeout || 0;
  _logDebug = options.logDebug || _logDebug;
  _logInfo = options.logInfo || _logInfo;
  _logWarning = options.logWarning || _logWarning;
  _logError = options.logError || _logError;
}

export let subscribeReqResChannel: <T>(channelLabel: string, executor: tRequestHandler<T>, context?: any) => void;
export let requestMaster: <T>(channelLabel: string, data: any, cback?: tResponseResolver<T>) => void | Promise<T>;
/*export let requestMaster:
  (<T>(channelLabel: string, data: any) => Promise<T>)|
  (<T>(channelLabel: string, data: any, cback: tResponseResolver<T>) => void)
;*/

const _ERROR_channelNotFound = 400;
const _ERROR_channelExecutorThrown = 500;
const _ERROR_channelTimeout = 600;

if (isMasterProcess()) {
  const registeredChannels: {
    [channelLabel: string]: {
      func: (data: any) => any;
      context: any
    }
  } = {};

  cluster.addListener("message", async (worker, message: tRequestArgs, handle) => {
    _logDebug(`ClusterBus::message from worker ${worker.id} with message ${JSON.stringify(message)}`);

    if ("transactionId" in message) {
      const transactionId = message.transactionId;
      const channelLabel = message.channelLabel;
      const channelWrapper = registeredChannels[channelLabel];

      const toSendObj = {
        transactionId
      } as tResponseArgs|tResponseThrownArgs;

      if (channelWrapper) {
        _logInfo(`ClusterBus::Channel '${channelLabel}' called within transaction '${transactionId}'`);

        const executor: (data: any) => void = channelWrapper.context ?
          channelWrapper.func.bind(channelWrapper.context) :
          channelWrapper.func;

        try {
          (toSendObj as tResponseArgs).data = await executor(message.data);
        } catch (err) {
          _logError(err);

          (toSendObj as tResponseThrownArgs).error = _ERROR_channelExecutorThrown;
          (toSendObj as tResponseThrownArgs).data = err;
        }
      } else {
        _logWarning(`ClusterBus::Channel labeled '${channelLabel}' called but not actually registered!`);

        (toSendObj as tResponseThrownArgs).error = _ERROR_channelNotFound;
      }
        
      worker.send(toSendObj);
    }
  });

  subscribeReqResChannel = function (channelLabel, executor, context?) {
    if (channelLabel in registeredChannels) {
      throw new Error("Already registered channel: " + channelLabel);
    }
    _logInfo(`ClusterBus::Registering '${channelLabel}' channel!`)

    registeredChannels[channelLabel] = {
      func: executor,
      context
    };
  };
} else {
  type tTransactionWrapper<T = any> = {
    resolver: tResponseResolver<T>,
    //TODO: add rejector
    timer?: NodeJS.Timer
  };

  const transactionSet: { [transactionId: string]: tTransactionWrapper } = {};

  //TODO: sendHandle?
  requestMaster = function <T>(channelLabel: string, data: any, cbackRecolver?: tResponseResolver<T>) {
    //TODO: manage collisions????
    const transactionId = Math.random().toString();

    _logDebug(`ClusterBus::sendTransaction '${transactionId}' on channel '${channelLabel}' with data ${JSON.stringify(data)}`);
    //_logInfo(`ClusterBus::sendTransaction "${transactionId}" on channel "${channelLabel}"`);

    setImmediate(() => process.send && process.send({
      channelLabel,
      transactionId,
      data
    } as tRequestArgs));

    const transactionWrapper: tTransactionWrapper = transactionSet[transactionId] = {
      resolver: null as any
    };

    if (_requestTimeout > 0) {
      transactionWrapper.timer = setTimeout(() => {
        _logWarning(`ClusterBus::sendTransaction '${transactionId}' on channel '${channelLabel}' timedout after ${_requestTimeout}[ms]!`)
        delete transactionSet[transactionId];
      }, _requestTimeout);
    }

    if (cbackRecolver) {
      transactionWrapper.resolver = cbackRecolver;
    } else {
      return new Promise((res, rej) => {
        transactionWrapper.resolver = res;
      });
    }
  }

  process.on("message", (args: tResponseArgs | tResponseThrownArgs) => {
    _logDebug(`ClusterBus::sendTransaction => on message: ${JSON.stringify(args)}`)

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