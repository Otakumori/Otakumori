import { inngest } from './client';
import { getPrintifyService } from '@/app/lib/printify/service';

// Sync Printify products every hour
export const syncPrintifyProducts = inngest.createFunction(
  { id: 'sync-printify-products' },
  { cron: '0 * * * *' }, // Every hour
  async ({ event, step }) => {
    return await step.run('sync-products', async () => {
      try {
        const products = await getPrintifyService().getAllProducts();

        return {
          success: true,
          productCount: products.length,
          triggeredBy: { eventId: event.id, eventName: event.name },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Scheduled sync failed:', error);
        throw error;
      }
    });
  },
);

// Manual sync trigger
export const manualPrintifySync = inngest.createFunction(
  { id: 'manual-printify-sync' },
  { event: 'printify/manual-sync' },
  async ({ event, step }) => {
    return await step.run('manual-sync', async () => {
      try {
        const products = await getPrintifyService().getAllProducts();

        return {
          success: true,
          productCount: products.length,
          triggeredBy: { eventId: event.id, eventName: event.name },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Manual sync failed:', error);
        throw error;
      }
    });
  },
);

// Sync on product changes (webhook)
export const syncOnProductChange = inngest.createFunction(
  { id: 'sync-on-product-change' },
  { event: 'printify/product-changed' },
  async ({ event, step }) => {
    return await step.run('sync-changed-product', async () => {
      try {
        const { productId } = event.data;
        const product = await getPrintifyService().getProduct(productId);

        return {
          success: true,
          productId,
          productTitle: product?.title ?? null,
          triggeredBy: { eventId: event.id, eventName: event.name },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Product change sync failed:', error);
        throw error;
      }
    });
  },
);
