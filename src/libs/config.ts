import path from "path";


export type tApiConfig =  {
  name: string;
  options: any;
}
export type tTenantConfig = {
  name: string;
  locale: string[];
  cacheMaxAge: number;

  apis: tApiConfig[];
};
export type tConfig = {
  stats: {
    logs: {
      path: string
    }
  },
  server: {
    port: number;
  },
  services: {
    db: {
      path: string;
    },
    apis: {[name: string]: tApiConfig},
  },
  target: {
    root: string;
  };
  tenants: {[domain: string]: tTenantConfig};
};

/*export module tConfig {
  export module tenants {
    export function rootFolder(tenant: any) {
      const config = loadConfiguration();
      return path.join(config.target.root, tenant.name);
    }
  }
}*/

const configFileName = "inia-config.json";

let _loadedConfiguration: tConfig|null = null;

export function loadConfiguration() {
  /*if (!_loadedConfiguration) {
    _loadedConfiguration = require(path.join(process.cwd(), configFileName)) as tConfig);

    for (var tenantKey in _loadedConfiguration) {
      const tenant = _loadedConfiguration.tenants[tenantKey];

      tenant.root = tenantKey;
    }
  }*/
  return _loadedConfiguration || (_loadedConfiguration = require(path.join(process.cwd(), configFileName)) as tConfig);
}