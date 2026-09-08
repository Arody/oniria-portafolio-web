module.exports = {
  apps: [{
    name: 'oniria-weddings',
    cwd: __dirname,
    script: 'node_modules/next/dist/bin/next',
    args: 'start --hostname 127.0.0.1',
    instances: 1,
    exec_mode: 'fork',
    env: { PORT: 3017, NODE_ENV: 'production' },
  }],
};
