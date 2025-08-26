/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
require('dotenv').config();
const cron = require('node-cron');
const { logger } = require('../lib/logger');
const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs').promises;
const archiver = require('archiver');

// Schedule database maintenance (daily at 2 AM)
cron.schedule('0 2 * * *', async () => {
  logger.info('Starting scheduled database maintenance...');
  try {
    await execAsync('npm run db:maintain');
    logger.info('Scheduled database maintenance completed');
  } catch (error) {
    logger.error('Scheduled database maintenance failed', { error });
  }
});

// Schedule system health check (every 6 hours)
cron.schedule('0 */6 * * *', async () => {
  logger.info('Starting scheduled system health check...');
  try {
    await execAsync('npm run system:check');
    logger.info('Scheduled system health check completed');
  } catch (error) {
    logger.error('Scheduled system health check failed', { error });
  }
});

// Schedule health report generation (daily at 1 AM)
cron.schedule('0 1 * * *', async () => {
  logger.info('Starting scheduled health report generation...');
  try {
    await execAsync('npm run system:report');
    logger.info('Scheduled health report generation completed');
  } catch (error) {
    logger.error('Scheduled health report generation failed', { error });
  }
});

// Schedule log rotation (weekly on Sunday at 3 AM)
cron.schedule('0 3 * * 0', async () => {
  logger.info('Starting scheduled log rotation...');
  try {
    await execAsync('npm run logs:rotate');
    logger.info('Scheduled log rotation completed');
  } catch (error) {
    logger.error('Scheduled log rotation failed', { error });
  }
});

// Keep the script running
logger.info('Maintenance scheduler started');
process.on('SIGINT', () => {
  logger.info('Maintenance scheduler stopped');
  process.exit(0);
});
