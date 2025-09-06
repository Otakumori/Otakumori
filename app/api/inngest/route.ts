// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import {
  syncUserToSupabase,
  updatePrintifyProducts,
  processOrder,
  sendOrderConfirmation,
  syncInventory,
  processPaymentWebhook,
  dailyInventorySync,
  weeklyProductUpdate,
  retryFailedOperation,
  cleanupOldData,
} from '../../../inngest/functions';

// Create an API route that serves the Inngest functions
// Next.js App Router requires GET, POST, and PUT methods
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserToSupabase,
    updatePrintifyProducts,
    processOrder,
    sendOrderConfirmation,
    syncInventory,
    processPaymentWebhook,
    dailyInventorySync,
    weeklyProductUpdate,
    retryFailedOperation,
    cleanupOldData,
  ],
});
