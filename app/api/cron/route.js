import { exec } from 'child_process';
import path from 'path';
import { NextResponse } from 'next/server';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log file path
const logFile = path.join(logsDir, 'api-cron.log');

// Enhanced logging function
function log(message, type = 'INFO', error = null) {
  const timestamp = new Date().toISOString();
  const logMessage = {
    timestamp,
    type,
    message,
    ...(error && { error: error.message, stack: error.stack }),
  };

  const logString = JSON.stringify(logMessage) + '\n';

  // Log to console
  console.log(`[${timestamp}] [${type}] ${message}`);
  if (error) {
    console.error(`[${timestamp}] [${type}] Error:`, error);
  }

  // Log to file
  fs.appendFileSync(logFile, logString);
}

// Validate environment variables
function validateEnv() {
  const requiredEnvVars = [
    'CRON_SECRET',
    'PRINTIFY_API_KEY',
    'PRINTIFY_SHOP_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

export async function GET(request) {
  try {
    // Validate environment variables
    validateEnv();

    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      log('Missing authorization header', 'ERROR');
      return new NextResponse('Unauthorized - Missing authorization header', { status: 401 });
    }

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      log('Invalid authorization token', 'ERROR');
      return new NextResponse('Unauthorized - Invalid token', { status: 401 });
    }

    log('Starting cron job execution');

    const scriptPath = path.join(process.cwd(), 'scripts', 'updatePrintifyProducts.js');

    // Verify script exists
    if (!fs.existsSync(scriptPath)) {
      const error = new Error(`Script not found at path: ${scriptPath}`);
      log('Script not found', 'ERROR', error);
      return new NextResponse('Script not found', { status: 500 });
    }

    return new Promise(resolve => {
      const startTime = Date.now();

      exec(`node ${scriptPath}`, (error, stdout, stderr) => {
        const duration = Date.now() - startTime;

        if (error) {
          log('Error executing update script', 'ERROR', error);
          resolve(
            new NextResponse('Error executing update script', {
              status: 500,
              headers: {
                'X-Execution-Time': `${duration}ms`,
              },
            })
          );
          return;
        }

        if (stderr) {
          log('Script produced stderr output', 'WARN', new Error(stderr));
        }

        log(`Script execution completed in ${duration}ms`, 'INFO');
        log(`Script output: ${stdout}`, 'DEBUG');

        resolve(
          new NextResponse('Update completed successfully', {
            status: 200,
            headers: {
              'X-Execution-Time': `${duration}ms`,
            },
          })
        );
      });
    });
  } catch (error) {
    log('Unhandled error in cron endpoint', 'ERROR', error);
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: {
        'X-Error-Type': error.name,
      },
    });
  }
}
