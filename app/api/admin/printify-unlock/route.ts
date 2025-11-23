// Admin endpoint to unlock stuck Printify products
import { requireAdminOrThrow } from '@/lib/adminGuard';
import { getPrintifyService } from '@/app/lib/printify/service';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  await requireAdminOrThrow();
  
  try {
    const printifyService = getPrintifyService();
    const body = await request.json();
    const { productId, unlockAll } = body;

    if (unlockAll) {
      // Unlock all locked products
      const lockedProducts = await db.product.findMany({
        where: {
          printifyProductId: { not: null },
          specs: {
            path: ['is_locked'],
            equals: true,
          },
        },
        select: {
          printifyProductId: true,
          name: true,
        },
      });

      const results = {
        unlocked: [] as string[],
        failed: [] as Array<{ productId: string; error: string }>,
      };

      for (const product of lockedProducts) {
        if (!product.printifyProductId) continue;
        
        try {
          await printifyService.publishingSucceeded(product.printifyProductId);
          results.unlocked.push(product.printifyProductId);
          
          // Update database to reflect unlocked status
          const existingProduct = await db.product.findUnique({
            where: { printifyProductId: product.printifyProductId },
            select: { specs: true },
          });
          
          const currentSpecs = (existingProduct?.specs as any) ?? {};
          await db.product.update({
            where: { printifyProductId: product.printifyProductId },
            data: {
              specs: {
                ...currentSpecs,
                is_locked: false,
              },
            },
          });
        } catch (error) {
          results.failed.push({
            productId: product.printifyProductId,
            error: String(error),
          });
        }
      }

      return Response.json({
        ok: true,
        message: `Unlocked ${results.unlocked.length} products, ${results.failed.length} failed`,
        results,
      });
    }

    if (!productId) {
      return Response.json({ ok: false, error: 'productId required or set unlockAll: true' }, { status: 400 });
    }

    // Unlock single product
    await printifyService.publishingSucceeded(String(productId));
    
    // Update database
    const existingProduct = await db.product.findFirst({
      where: { printifyProductId: String(productId) },
      select: { specs: true },
    });
    
    const currentSpecs = (existingProduct?.specs as any) ?? {};
    await db.product.updateMany({
      where: { printifyProductId: String(productId) },
      data: {
        specs: {
          ...currentSpecs,
          is_locked: false,
        },
      },
    });

    return Response.json({
      ok: true,
      message: `Product ${productId} unlocked successfully`,
    });
  } catch (error) {
    console.error('Unlock failed:', error);
    return Response.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}

