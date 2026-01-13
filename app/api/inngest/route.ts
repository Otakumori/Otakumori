/**
 * Inngest API Route
 *
 * This is the official Inngest integration endpoint for background job processing.
 * Handles all Inngest functions including:
 * - User management (Clerk sync)
 * - Order processing
 * - Product/inventory sync
 * - Scheduled jobs (daily, weekly)
 * - Payment webhooks
 *
 * Required environment variables:
 * - INNGEST_EVENT_KEY: For sending events to Inngest
 * - INNGEST_SIGNING_KEY: For webhook signature verification
 */
import { serve } from 'inngest/next';
import { env } from '@/env.mjs';
import { inngest } from '../../../inngest/client';
import {
  syncUserToSupabase,
  updatePrintifyProducts,
  processOrder,
  sendOrderConfirmation,
  sendOrderConfirmationEmail,
  syncInventory,
  processPaymentWebhook,
  dailyInventorySync,
  weeklyProductUpdate,
  retryFailedOperation,
  cleanupOldData,
  cleanupOldGLBFiles,
  fulfillOrder,
} from '../../../inngest/functions';
import { generateGLBBackground } from '../../../inngest/glb-generation';

export const runtime = 'nodejs';

// Create an API route that serves the Inngest functions
// Next.js App Router requires GET, POST, and PUT methods

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserToSupabase,
    updatePrintifyProducts,
    processOrder,
    sendOrderConfirmation,
    sendOrderConfirmationEmail,
    fulfillOrder,
    syncInventory,
    processPaymentWebhook,
    dailyInventorySync,
    weeklyProductUpdate,
    retryFailedOperation,
    cleanupOldData,
    cleanupOldGLBFiles,
    generateGLBBackground,
  ],
  signingKey: env.INNGEST_SIGNING_KEY,
});
