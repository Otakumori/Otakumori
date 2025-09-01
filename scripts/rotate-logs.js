 
 
const fs = require('fs');
const path = require('path');
const { createGzip } = require('zlib');
const { pipeline } = require('stream/promises');
const { logger } = require('../lib/logger');

const LOGS_DIR = path.join(process.cwd(), 'logs');
const MAX_LOG_AGE_DAYS = 7;

async function rotateLogs() {
  try {
    logger.info('Starting log rotation');

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR);
    }

    const files = fs.readdirSync(LOGS_DIR);
    const now = new Date();

    for (const file of files) {
      const filePath = path.join(LOGS_DIR, file);
      const stats = fs.statSync(filePath);

      // Skip if not a file or if it's already compressed
      if (!stats.isFile() || file.endsWith('.gz')) continue;

      const fileAge = (now - stats.mtime) / (1000 * 60 * 60 * 24);

      if (fileAge > MAX_LOG_AGE_DAYS) {
        const gzipPath = `${filePath}.gz`;

        // Compress the file
        await pipeline(fs.createReadStream(filePath), createGzip(), fs.createWriteStream(gzipPath));

        // Remove the original file
        fs.unlinkSync(filePath);
        logger.info(`Rotated log file: ${file}`);
      }
    }

    // Remove old compressed logs
    const compressedFiles = files.filter((file) => file.endsWith('.gz'));
    for (const file of compressedFiles) {
      const filePath = path.join(LOGS_DIR, file);
      const stats = fs.statSync(filePath);
      const fileAge = (now - stats.mtime) / (1000 * 60 * 60 * 24);

      if (fileAge > MAX_LOG_AGE_DAYS * 2) {
        fs.unlinkSync(filePath);
        logger.info(`Removed old log file: ${file}`);
      }
    }

    logger.info('Log rotation completed successfully');
  } catch (error) {
    logger.error('Log rotation failed', { error });
    process.exit(1);
  }
}

// Run log rotation
rotateLogs().catch((error) => {
  logger.error('Failed to rotate logs', { error });
  process.exit(1);
});
