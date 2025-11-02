require('dotenv').config();
const cron = require('node-cron');
const { logger } = require('../lib/logger');
const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs');
const fsp = fs.promises;
const archiver = require('archiver');

const logsDir = path.join(process.cwd(), 'logs');
const archiveDir = path.join(logsDir, 'archives');

async function ensureDirectory(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function directoryExists(dirPath) {
  try {
    const stats = await fsp.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function archiveLogs() {
  if (!(await directoryExists(logsDir))) {
    logger.warn('Skipping log archive: logs directory not found', { logsDir });
    return;
  }

  await ensureDirectory(archiveDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(archiveDir, `logs-${timestamp}.zip`);

  const output = fs.createWriteStream(archivePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const finalizePromise = new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
    archive.on('warning', (warning) => {
      logger.warn('Archiver warning while creating log backup', { warning });
    });
  });

  archive.pipe(output);
  archive.glob('**/*', { cwd: logsDir, ignore: ['archives/**'] });
  archive.finalize();

  await finalizePromise;
  logger.info('Log archive created', { archivePath });
}

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
    await archiveLogs();
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
