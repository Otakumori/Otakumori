const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');
const { logger } = require('../lib/logger');

// Schedule log rotation to run daily at midnight
cron.schedule('0 0 * * *', () => {
  logger.info('Starting scheduled log rotation');

  const rotateLogs = spawn('node', [path.join(__dirname, 'rotate-logs.js')], {
    stdio: 'inherit',
    env: {
      ...process.env, // eslint-disable-line no-restricted-syntax
      NODE_ENV: 'production',
    },
  });

  rotateLogs.on('error', (error) => {
    logger.error('Failed to start log rotation:', error);
  });

  rotateLogs.on('exit', (code) => {
    if (code !== 0) {
      logger.error(`Log rotation exited with code ${code}`);
    } else {
      logger.info('Log rotation completed successfully');
    }
  });
});

logger.info('Log rotation scheduler started');

// Handle process termination
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM signal, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT signal, shutting down...');
  process.exit(0);
});
