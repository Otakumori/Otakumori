import { inngest } from './client';
import { getPrintifyService } from '@/app/lib/printify/service';

// Sync Printify products every hour
export const syncPrintifyProducts = inngest.createFunction(
  { id: 'sync-printify-products' },
  { cron: '0 * * * *' }, // Every hour
  async ({ event, step }) => {
    return await step.run('sync-products', async () => {
      try {
        // 'Starting scheduled Printify sync...'

        const products = await getPrintifyService().getAllProducts();

        // `Sync completed: ${products.length} products fetched`

        // Here you would save to your database
        // await saveProductsToDatabase(products);

        return {
          success: true,
          productCount: products.length,
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
        // 'Starting manual Printify sync...'

        const products = await getPrintifyService().getAllProducts();

        // `Manual sync completed: ${products.length} products fetched`

        // Here you would save to your database
        // await saveProductsToDatabase(products);

        return {
          success: true,
          productCount: products.length,
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

        // `Syncing changed product: ${productId}`

        const product = await getPrintifyService().getProduct(productId);

        // Here you would update the specific product in your database
        // await updateProductInDatabase(product);

        return {
          success: true,
          productId,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Product change sync failed:', error);
        throw error;
      }
    });
  },
);
