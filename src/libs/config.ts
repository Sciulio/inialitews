import path from "path";


export type tConfig = {
  debug: {
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
    apis: {[name: string]: any},
  },
  target: {
    root: string;
  };
  tenants: {[domain: string]: {
    name: string;
    locale: string[];
    cacheMaxAge: number;
  }};
};

const configFileName = "inia-config.json";

let _loadedConfiguration: tConfig|null = null;

export function loadConfiguration() {
  return _loadedConfiguration || (_loadedConfiguration = require(path.join(process.cwd(), configFileName)) as tConfig);
}