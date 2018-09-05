import Cluster from "cluster";


export function isMasterProcess(): boolean {
  // configuration for Pm2 with default 'instance_var' config option
  if ("NODE_APP_INSTANCE" in process.env) {
    return process.env.NODE_APP_INSTANCE as any === 0;
  }

  // nodejs module parenting is not reliable
  return Cluster.isMaster || processId() == 0 || !!module.parent && !module.parent.parent;
}

export function processId(): number {
  // configuration for Pm2 with default 'instance_var' config option
  if ("NODE_APP_INSTANCE" in process.env) {
    return process.env.NODE_APP_INSTANCE as any;
  }

  return Cluster.worker && Cluster.worker.process.pid || 0;
}