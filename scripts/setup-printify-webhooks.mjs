#!/usr/bin/env node

/**
 * Printify Webhook Auto-Registration Script
 * 
 * Automatically registers required webhooks with Printify on deployment.
 * Ensures webhooks are always configured correctly.
 * 
 * Usage:
 *   node scripts/setup-printify-webhooks.mjs [--dry-run] [--base-url=https://your-domain.com]
 */

// Use dynamic imports for ESM modules
let env, getPrintifyWebhookManager;

async function loadModules() {
  const envModule = await import('../env.mjs');
  const webhookModule = await import('../app/lib/printify/webhooks.js');
  env = envModule.env;
  getPrintifyWebhookManager = webhookModule.getPrintifyWebhookManager;
}

const REQUIRED_WEBHOOKS = [
  'order:created',
  'order:sent_to_production',
  'order:shipment_created',
  'order:shipment_delivered',
  'order:cancelled',
  'product:updated',
  'inventory:updated',
];

async function getBaseUrl() {
  // Check command line argument
  const args = process.argv.slice(2);
  const baseUrlArg = args.find((arg) => arg.startsWith('--base-url='));
  if (baseUrlArg) {
    return baseUrlArg.split('=')[1];
  }

  // Check environment variable
  if (env.BASE_URL) {
    return env.BASE_URL;
  }

  // Check NEXT_PUBLIC_SITE_URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Check Vercel URL
  if (process.env.VERCEL_URL) {
    const protocol = process.env.VERCEL_ENV === 'production' ? 'https' : 'https';
    return `${protocol}://${process.env.VERCEL_URL}`;
  }

  // Default to localhost for development
  return 'http://localhost:3000';
}

function getWebhookUrl(baseUrl) {
  return `${baseUrl}/api/webhooks/printify`;
}

async function setupWebhooks(dryRun = false) {
  const baseUrl = await getBaseUrl();
  const webhookUrl = getWebhookUrl(baseUrl);

  console.log('🔗 Printify Webhook Auto-Registration');
  console.log('=====================================\n');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Webhook URL: ${webhookUrl}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (will register webhooks)'}\n`);

  if (!env.PRINTIFY_API_KEY) {
    console.error('❌ ERROR: PRINTIFY_API_KEY environment variable is not set');
    process.exit(1);
  }

  if (!env.PRINTIFY_SHOP_ID) {
    console.error('❌ ERROR: PRINTIFY_SHOP_ID environment variable is not set');
    process.exit(1);
  }

  try {
    const manager = getPrintifyWebhookManager();
    const existingWebhooks = await manager.listWebhooks();

    console.log(`📋 Found ${existingWebhooks.length} existing webhook(s)\n`);

    const webhookMap = new Map();
    existingWebhooks.forEach((webhook) => {
      webhookMap.set(webhook.topic, webhook);
    });

    const toCreate = [];
    const toUpdate = [];
    const alreadyConfigured = [];

    for (const topic of REQUIRED_WEBHOOKS) {
      const existing = webhookMap.get(topic);

      if (!existing) {
        toCreate.push(topic);
        console.log(`➕ Will create webhook: ${topic}`);
      } else if (existing.url !== webhookUrl) {
        toUpdate.push({ topic, webhookId: existing.id, oldUrl: existing.url });
        console.log(`🔄 Will update webhook: ${topic}`);
        console.log(`   Old URL: ${existing.url}`);
        console.log(`   New URL: ${webhookUrl}`);
      } else {
        alreadyConfigured.push(topic);
        console.log(`✅ Already configured: ${topic}`);
      }
    }

    console.log('\n');

    if (dryRun) {
      console.log('🔍 DRY RUN - No changes made');
      console.log(`   Would create: ${toCreate.length} webhook(s)`);
      console.log(`   Would update: ${toUpdate.length} webhook(s)`);
      console.log(`   Already configured: ${alreadyConfigured.length} webhook(s)`);
      return;
    }

    // Create new webhooks
    for (const topic of toCreate) {
      try {
        console.log(`Creating webhook: ${topic}...`);
        const webhook = await manager.createWebhook(webhookUrl, topic);
        console.log(`✅ Created webhook ${webhook.id} for ${topic}`);
      } catch (error) {
        console.error(`❌ Failed to create webhook for ${topic}:`, error.message);
      }
    }

    // Update existing webhooks with wrong URL
    for (const { topic, webhookId, oldUrl } of toUpdate) {
      try {
        console.log(`Updating webhook: ${topic}...`);
        const webhook = await manager.updateWebhook(webhookId, { url: webhookUrl });
        console.log(`✅ Updated webhook ${webhook.id} for ${topic}`);
      } catch (error) {
        console.error(`❌ Failed to update webhook for ${topic}:`, error.message);
      }
    }

    // Clean up webhooks that are no longer needed (optional - commented out for safety)
    // Uncomment if you want to remove webhooks not in REQUIRED_WEBHOOKS list
    /*
    const toRemove = existingWebhooks.filter(
      (webhook) => !REQUIRED_WEBHOOKS.includes(webhook.topic)
    );
    for (const webhook of toRemove) {
      try {
        console.log(`Removing obsolete webhook: ${webhook.topic}...`);
        await manager.deleteWebhook(webhook.id);
        console.log(`✅ Removed webhook ${webhook.id} for ${webhook.topic}`);
      } catch (error) {
        console.error(`❌ Failed to remove webhook for ${webhook.topic}:`, error.message);
      }
    }
    */

    console.log('\n✅ Webhook setup complete!');
    console.log(`   Created: ${toCreate.length}`);
    console.log(`   Updated: ${toUpdate.length}`);
    console.log(`   Already configured: ${alreadyConfigured.length}`);
  } catch (error) {
    console.error('❌ Error setting up webhooks:', error);
    process.exit(1);
  }
}

// Main execution
(async () => {
  try {
    await loadModules();
    
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || args.includes('-d');

    await setupWebhooks(dryRun);
    console.log('\n✨ Done!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
})();

