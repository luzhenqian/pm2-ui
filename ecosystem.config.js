module.exports = {
  apps: [
    {
      name: 'pm2-ui',
      script: 'server/dist/main.js',
      cwd: './',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_file: './server/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3030,
        HOST: '0.0.0.0',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
      error_file: './logs/pm2-ui-error.log',
      out_file: './logs/pm2-ui-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
