module.exports = {
  apps: [
    {
      name: 'api',
      script: 'build/src/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
