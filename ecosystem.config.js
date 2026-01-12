/**
 * PM2 Ecosystem Configuration
 * Process manager configuration for production deployment
 */

module.exports = {
  apps: [
    {
      name: 'ghana-emergency',
      script: 'npm',
      args: 'start',
      instances: 2, // Use 2 instances (adjust based on CPU cores)
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Auto-restart
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // Advanced
      min_uptime: '10s',
      max_restarts: 10,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};

