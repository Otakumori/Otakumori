const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log file path
const logFile = path.join(logsDir, 'cron.log');

// Logging function
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  
  // Log to console
  console.log(logMessage.trim());
  
  // Log to file
  fs.appendFileSync(logFile, logMessage);
}

// Run every hour
cron.schedule('0 * * * *', () => {
  log('Starting scheduled Printify product update...');
  
  const scriptPath = path.join(__dirname, 'updatePrintifyProducts.js');
  
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      log(`Error executing update script: ${error}`, 'ERROR');
      return;
    }
    if (stderr) {
      log(`Script stderr: ${stderr}`, 'WARN');
    }
    if (stdout) {
      log(`Script stdout: ${stdout}`);
    }
    log('Scheduled update completed');
  });
});

// Log startup
log('Cron job scheduler started');

// Handle process termination
process.on('SIGTERM', () => {
  log('Received SIGTERM signal. Shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('Received SIGINT signal. Shutting down...');
  process.exit(0);
}); 