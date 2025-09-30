const { spawn } = require('child_process');
const path = require('path');

// Start the metrics collector
const collector = spawn('ts-node', [path.join(__dirname, 'collect-metrics.ts')], {
  stdio: 'inherit',
  env: {
    ...process.env,  
    NODE_ENV: 'production',
  },
});

collector.on('error', (error) => {
  console.error('Failed to start metrics collector:', error);
  process.exit(1);
});

collector.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Metrics collector exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  collector.kill('SIGTERM');
});

process.on('SIGINT', () => {
  collector.kill('SIGINT');
});
