#!/usr/bin/env node

// Set build-time environment variables to disable Sentry/OpenTelemetry
process.env.SENTRY_SKIP_AUTO_RELEASE = 'true';
process.env.SENTRY_UPLOAD_SOURCE_MAPS = 'false';
process.env.SENTRY_IGNORE_API_RESOLUTION_ERROR = 'true';
process.env.OTEL_SDK_DISABLED = 'true';

// Import and run Next.js build
import { spawn } from 'child_process';

const child = spawn('next', ['build'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('close', (code) => {
  process.exit(code);
});
