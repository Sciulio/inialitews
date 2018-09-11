import Cluster, { worker } from "cluster";


export function isMasterProcess(): boolean {
  // configuration for Pm2 with default 'instance_var' config option
  if ("NODE_APP_INSTANCE" in process.env) {
    return process.env.NODE_APP_INSTANCE as any === 0;
  }

  // nodejs module parenting is not reliable
  return Cluster.isMaster; // || workerId() == 0; // || !!module.parent && !module.parent.parent;
}

export function workerId(): number {
  // configuration for Pm2 with default 'instance_var' config option
  if ("NODE_APP_INSTANCE" in process.env) {
    return process.env.NODE_APP_INSTANCE as any;
  }

  return Cluster.worker && Cluster.worker.process.pid || 0;
}

export function processKey(): string {
  if (Cluster.worker) {
    return worker.id + "_" + Cluster.worker.process.pid;
  }
  return 0 + "_" + process.pid;
}

export function isProduction() {
  return process.env.NODE_ENV == 'production';
}