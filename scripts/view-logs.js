const { logger } = require('../lib/logger');

async function viewLogs() {
  try {
    const logs = await logger.getRecentLogs(100);
    
    console.log('\nRecent Application Logs:');
    console.log('======================\n');
    
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp).toLocaleString();
      const level = log.level.toUpperCase().padEnd(7);
      const message = log.message;
      const metadata = log.metadata ? `\n  Metadata: ${JSON.stringify(log.metadata, null, 2)}` : '';
      
      console.log(`[${timestamp}] ${level} ${message}${metadata}`);
    });
    
    console.log('\nEnd of logs');
  } catch (error) {
    console.error('Error viewing logs:', error);
    process.exit(1);
  }
}

viewLogs(); 