 
 
const { spawn } = require('child_process');
const path = require('path');

// Start the health checker
const healthChecker = spawn('ts-node', [path.join(__dirname, 'check-health.ts')], {
  stdio: 'inherit',
  env: {
    ...process.env, // eslint-disable-line no-restricted-syntax
    NODE_ENV: 'production',
  },
});

healthChecker.on('error', (error) => {
  console.error('Failed to start health checker:', error);
  process.exit(1);
});

healthChecker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Health checker exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  healthChecker.kill('SIGTERM');
});

process.on('SIGINT', () => {
  healthChecker.kill('SIGINT');
});
