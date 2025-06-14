require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../lib/logger');
const { exec } = require("child_process")
const { promisify } = require("util")
const execAsync = promisify(exec)
const { monitor } = require("../lib/monitor")

const supabase = createClient(
  process.env.POSTGRES_SUPABASE_URL,
  process.env.POSTGRES_SUPABASE_SERVICE_ROLE_KEY
);

async function runMaintenance() {
  try {
    logger.info("Starting database maintenance")

    // Run VACUUM ANALYZE
    logger.info("Running VACUUM ANALYZE")
    await execAsync("npx supabase db vacuum-analyze")

    // Run REINDEX
    logger.info("Running REINDEX")
    await execAsync("npx supabase db reindex")

    // Check database health
    const health = await monitor.checkHealth()
    logger.info("Database health check completed", { health })

    // Collect metrics
    const metrics = await monitor.collectMetrics()
    logger.info("Metrics collected", { metrics })

    logger.info("Database maintenance completed successfully")
  } catch (error) {
    logger.error("Database maintenance failed", { error })
    process.exit(1)
  }
}

// Run maintenance
runMaintenance(); 