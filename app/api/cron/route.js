import { exec } from 'child_process';
import path from 'path';
import { NextResponse } from 'next/server';
import fs from 'fs';
import { env } from '../../../env';

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
  // Skip validation in development
  if (env.NODE_ENV === 'development') {
    return;
  }

  const requiredEnvVars = [
    'CRON_SECRET',
    'PRINTIFY_API_KEY',
    'PRINTIFY_SHOP_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Validate environment variables
    validateEnv();

    // --- Authorization check removed for now ---
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader) {
    //   log('Missing authorization header', 'ERROR');
    //   return new NextResponse('Unauthorized - Missing authorization header', { status: 401 });
    // }
    // if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    //   log('Invalid authorization token', 'ERROR');
    //   return new NextResponse('Unauthorized - Invalid token', { status: 401 });
    // }

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
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                error: error.message,
                duration,
                timestamp: new Date().toISOString(),
              }),
            })
          );
          return;
        }

        log(`Script executed successfully in ${duration}ms`);
        log(`STDOUT: ${stdout}`);
        if (stderr) {
          log(`STDERR: ${stderr}`, 'WARN');
        }

        resolve(
          new NextResponse(
            JSON.stringify({
              success: true,
              message: 'Cron job executed successfully',
              duration,
              timestamp: new Date().toISOString(),
              stdout: stdout.trim(),
              stderr: stderr.trim() || null,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
        );
      });
    });
  } catch (error) {
    log('Unhandled error in cron endpoint', 'ERROR', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
