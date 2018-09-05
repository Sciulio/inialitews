module.exports = {
  apps: [{
    name: "server",
    script: "./dist/index.js",
    disable_logs: true,
    //instances: "max",
    //instance_var: "INSTANCE_ID", default: "NODE_APP_INSTANCE" => process.env.NODE_APP_INSTANCE === 0
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}