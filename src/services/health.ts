import { env } from '@/env.mjs';
import type { Result } from './types';
import { safeAsync } from './types';
import { checkClerkHealth } from './clerk';
import { checkPrintifyHealth } from './printify';
import { checkStripeHealth } from './stripe';

export interface HealthStatus {
  status: 'up' | 'down' | 'degraded';
  timestamp: string;
  services: {
    clerk: 'ok' | 'degraded' | 'down';
    printify: 'ok' | 'degraded' | 'down';
    stripe: 'ok' | 'degraded' | 'down';
    database: 'ok' | 'degraded' | 'down';
  };
  environment: {
    nodeEnv: string;
    hasRequiredEnvs: boolean;
    missingEnvs: string[];
  };
}

export async function checkHealth(): Promise<Result<HealthStatus>> {
  return safeAsync(
    async () => {
      const timestamp = new Date().toISOString();

      // Check required environment variables
      const requiredEnvs = [
        'NEXT_PUBLIC_SITE_URL',
        'DATABASE_URL',
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
        'PRINTIFY_API_KEY',
        'PRINTIFY_SHOP_ID',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY',
      ];

      const missingEnvs = requiredEnvs.filter((envVar) => {
        const value = env[envVar as keyof typeof env];
        return !value || (typeof value === 'string' && value.trim() === '');
      });

      const hasRequiredEnvs = missingEnvs.length === 0;

      // Check services in parallel
      const [clerkResult, printifyResult, stripeResult, dbResult] = await Promise.allSettled([
        checkClerkHealth(),
        checkPrintifyHealth(),
        checkStripeHealth(),
        checkDatabaseHealth(),
      ]);

      // Map results to service status
      const services = {
        clerk: mapServiceStatus(clerkResult),
        printify: mapServiceStatus(printifyResult),
        stripe: mapServiceStatus(stripeResult),
        database: mapServiceStatus(dbResult),
      };

      // Determine overall status
      const serviceStatuses = Object.values(services);
      const allOk = serviceStatuses.every((status) => status === 'ok');
      const anyDown = serviceStatuses.some((status) => status === 'down');

      let status: 'up' | 'down' | 'degraded';
      if (!hasRequiredEnvs || anyDown) {
        status = 'down';
      } else if (allOk) {
        status = 'up';
      } else {
        status = 'degraded';
      }

      return {
        status,
        timestamp,
        services,
        environment: {
          nodeEnv: env.NODE_ENV,
          hasRequiredEnvs,
          missingEnvs,
        },
      };
    },
    'HEALTH_CHECK_ERROR',
    'Failed to perform health check',
  );
}

async function checkDatabaseHealth(): Promise<Result<boolean>> {
  return safeAsync(
    async () => {
      // Simple database connection test
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      } finally {
        await prisma.$disconnect();
      }
    },
    'DATABASE_HEALTH_CHECK_ERROR',
    'Failed to check database health',
  );
}

function mapServiceStatus(
  result: PromiseSettledResult<Result<boolean>>,
): 'ok' | 'degraded' | 'down' {
  if (result.status === 'rejected') {
    return 'down';
  }

  if (!result.value.ok) {
    return 'down';
  }

  return result.value.data ? 'ok' : 'degraded';
}
