#!/usr/bin/env tsx

/**
 * Continuous API Monitoring Script
 * This script runs continuously to monitor API health and alert on issues
 * Can be run as a background service or in production monitoring
 */

interface MonitoringConfig {
  checkInterval: number; // milliseconds
  alertThreshold: number; // consecutive failures before alerting
  endpoints: string[];
  webhookUrl?: string; // Discord/Slack webhook for alerts
}

class APIMonitor {
  private config: MonitoringConfig;
  private failureCount: Map<string, number> = new Map();
  private isRunning: boolean = false;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    this.isRunning = true;
    console.log('🚀 Starting API Monitoring...');
    console.log(
      `📊 Checking ${this.config.endpoints.length} endpoints every ${this.config.checkInterval / 1000}s`
    );

    while (this.isRunning) {
      await this.runHealthCheck();
      await this.sleep(this.config.checkInterval);
    }
  }

  stop(): void {
    this.isRunning = false;
    console.log('🛑 API Monitoring stopped');
  }

  private async runHealthCheck(): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 [${timestamp}] Running health check...`);

    for (const endpoint of this.config.endpoints) {
      try {
        const result = await this.checkEndpoint(endpoint);
        await this.processResult(endpoint, result);
      } catch (error) {
        console.error(`❌ Error checking ${endpoint}:`, error);
        await this.recordFailure(endpoint);
      }
    }
  }

  private async checkEndpoint(endpoint: string): Promise<any> {
    const startTime = Date.now();
    const response = await fetch(`http://localhost:3000${endpoint}`);
    const responseTime = Date.now() - startTime;

    return {
      status: response.status,
      responseTime,
      timestamp: new Date().toISOString(),
    };
  }

  private async processResult(endpoint: string, result: any): Promise<void> {
    if (result.status === 200) {
      console.log(`✅ ${endpoint}: ${result.status} (${result.responseTime}ms)`);
      this.failureCount.set(endpoint, 0); // Reset failure count
    } else {
      console.log(`❌ ${endpoint}: ${result.status} (${result.responseTime}ms)`);
      await this.recordFailure(endpoint);
    }
  }

  private async recordFailure(endpoint: string): Promise<void> {
    const currentFailures = this.failureCount.get(endpoint) || 0;
    const newFailureCount = currentFailures + 1;
    this.failureCount.set(endpoint, newFailureCount);

    if (newFailureCount >= this.config.alertThreshold) {
      await this.sendAlert(endpoint, newFailureCount);
    }
  }

  private async sendAlert(endpoint: string, failureCount: number): Promise<void> {
    const message = `🚨 API ALERT: ${endpoint} has failed ${failureCount} consecutive times!`;
    console.log(message);

    if (this.config.webhookUrl) {
      try {
        await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: message,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Failed to send webhook alert:', error);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus(): object {
    return {
      isRunning: this.isRunning,
      failureCounts: Object.fromEntries(this.failureCount),
      config: this.config,
    };
  }
}

// Configuration for monitoring
const monitoringConfig: MonitoringConfig = {
  checkInterval: 30000, // 30 seconds
  alertThreshold: 3, // Alert after 3 consecutive failures
  endpoints: [
    '/api/health',
    '/api/v1/shop/products?limit=1',
    '/api/soapstones',
    '/api/blog/posts',
    '/api/community/posts',
  ],
  // webhookUrl: process.env.DISCORD_WEBHOOK_URL, // Optional
};

// Run monitoring if called directly
if (require.main === module) {
  const monitor = new APIMonitor(monitoringConfig);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    monitor.stop();
    process.exit(0);
  });

  monitor.start().catch(console.error);
}

export type { APIMonitor, MonitoringConfig };
