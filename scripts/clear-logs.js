const fs = require('fs');
const path = require('path');
const { logger } = require('../lib/logger');

async function clearLogs() {
  try {
    logger.info('Starting log clearing');

    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      logger.info('Created logs directory');
      return;
    }

    const files = fs.readdirSync(logsDir);
    for (const file of files) {
      if (file.endsWith('.log')) {
        fs.writeFileSync(path.join(logsDir, file), '');
        logger.info(`Cleared log file: ${file}`);
      }
    }

    logger.info('Log clearing completed successfully');
  } catch (error) {
    logger.error('Log clearing failed', { error });
    process.exit(1);
  }
}

clearLogs();
