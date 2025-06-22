require('dotenv').config();
const { monitor } = require('../app/lib/monitor');
const { logger } = require('../app/lib/logger');
const { cache } = require('../app/lib/cache');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.POSTGRES_SUPABASE_URL,
  process.env.POSTGRES_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSystem() {
  try {
    logger.info('Starting system health check');

    // Check database health
    const health = await monitor.checkHealth();
    logger.info('System health check completed', { health });

    // Collect metrics
    const metrics = await monitor.collectMetrics();
    logger.info('System metrics collected', { metrics });

    // Check for any issues
    if (health.status !== 'healthy') {
      logger.warn('System health check found issues', { health });
      process.exit(1);
    }

    logger.info('System health check passed');
  } catch (error) {
    logger.error('System health check failed', { error });
    process.exit(1);
  }
}

checkSystem();
