module.exports = {
  apps: [{
    name: 'dashboard-api',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    node_args: '--max-old-space-size=2048',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'dist'],
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}; 