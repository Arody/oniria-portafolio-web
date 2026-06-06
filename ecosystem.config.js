module.exports = {
  apps: [
    {
      name: 'oniria-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 3017,
        NODE_ENV: 'production',
      },
    },
  ],
};
