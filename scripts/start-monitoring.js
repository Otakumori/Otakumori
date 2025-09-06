const { spawn } = require('child_process');
const path = require('path');

// Start metrics collector
const metricsCollector = spawn('node', [path.join(__dirname, 'start-metrics-collector.js')], {
  stdio: 'inherit',
  env: {
    ...process.env, // eslint-disable-line no-restricted-syntax
    NODE_ENV: 'production',
  },
});

// Start health checker
const healthChecker = spawn('node', [path.join(__dirname, 'start-health-check.js')], {
  stdio: 'inherit',
  env: {
    ...process.env, // eslint-disable-line no-restricted-syntax
    NODE_ENV: 'production',
  },
});

// Start log rotation scheduler
const logScheduler = spawn('node', [path.join(__dirname, 'cron-logs.js')], {
  stdio: 'inherit',
  env: {
    ...process.env, // eslint-disable-line no-restricted-syntax
    NODE_ENV: 'production',
  },
});

// Handle errors
metricsCollector.on('error', (error) => {
  console.error('Failed to start metrics collector:', error);
  process.exit(1);
});

healthChecker.on('error', (error) => {
  console.error('Failed to start health checker:', error);
  process.exit(1);
});

logScheduler.on('error', (error) => {
  console.error('Failed to start log scheduler:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  metricsCollector.kill('SIGTERM');
  healthChecker.kill('SIGTERM');
  logScheduler.kill('SIGTERM');
});

process.on('SIGINT', () => {
  metricsCollector.kill('SIGINT');
  healthChecker.kill('SIGINT');
  logScheduler.kill('SIGINT');
});
