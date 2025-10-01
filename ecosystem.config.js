const { config } = require('dotenv');
const { resolve } = require('path');

// Load environment variables from server/.env
const envPath = resolve(__dirname, 'server', '.env');
const envConfig = config({ path: envPath });

if (envConfig.error) {
  console.warn(`Warning: Could not load .env file from ${envPath}`);
  console.warn('Make sure server/.env exists with required configuration');
}

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
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 3030,
        HOST: process.env.HOST || '0.0.0.0',
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
        INITIAL_LOG_LINES: process.env.INITIAL_LOG_LINES || '100',
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
