import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    const cronLogFile = path.join(logsDir, 'api-cron.log');
    const updateLogFile = path.join(logsDir, 'cron.log');

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cron: {
        lastRun: null,
        status: 'unknown'
      },
      update: {
        lastRun: null,
        status: 'unknown'
      }
    };

    // Check cron API logs
    if (fs.existsSync(cronLogFile)) {
      const cronLogs = fs.readFileSync(cronLogFile, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line));

      const lastCronRun = cronLogs
        .filter(log => log.type === 'INFO' && log.message.includes('Script execution completed'))
        .pop();

      if (lastCronRun) {
        health.cron.lastRun = lastCronRun.timestamp;
        health.cron.status = 'running';
      }
    }

    // Check update script logs
    if (fs.existsSync(updateLogFile)) {
      const updateLogs = fs.readFileSync(updateLogFile, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line));

      const lastUpdate = updateLogs
        .filter(log => log.type === 'INFO' && log.message.includes('Product update completed'))
        .pop();

      if (lastUpdate) {
        health.update.lastRun = lastUpdate.timestamp;
        health.update.status = 'running';
      }
    }

    // Check if cron is running regularly
    if (health.cron.lastRun) {
      const lastRunTime = new Date(health.cron.lastRun);
      const now = new Date();
      const hoursSinceLastRun = (now - lastRunTime) / (1000 * 60 * 60);

      if (hoursSinceLastRun > 2) {
        health.cron.status = 'warning';
        health.status = 'degraded';
      }
    }

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
} 