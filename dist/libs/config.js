"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
/*export module tConfig {
  export module tenants {
    export function rootFolder(tenant: any) {
      const config = loadConfiguration();
      return path.join(config.target.root, tenant.name);
    }
  }
}*/
const configFileName = "inia-config.json";
let _loadedConfiguration = null;
function loadConfiguration() {
    /*if (!_loadedConfiguration) {
      _loadedConfiguration = require(path.join(process.cwd(), configFileName)) as tConfig);
  
      for (var tenantKey in _loadedConfiguration) {
        const tenant = _loadedConfiguration.tenants[tenantKey];
  
        tenant.root = tenantKey;
      }
    }*/
    return _loadedConfiguration || (_loadedConfiguration = require(path_1.default.join(process.cwd(), configFileName)));
}
exports.loadConfiguration = loadConfiguration;
//# sourceMappingURL=config.js.map