module.exports = {
  apps: [{
    name: "server",
    script: "./dist/index.js",
    disable_logs: true,
    instances: "max",
    //instance_var: "INSTANCE_ID", default: "NODE_APP_INSTANCE" => process.env.NODE_APP_INSTANCE === 0
    env: {
      PORT: 3000,
      NODE_ENV: "development",
    },
    env_staging : {
      PORT: 80,
      NODE_ENV: "staging"
    },
    env_production: {
      PORT: 8080,
      NODE_ENV: "production",
    }
  }]
}