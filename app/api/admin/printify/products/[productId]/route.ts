import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { getPrintifyService } from '@/app/lib/printify/service';
import { z } from 'zod';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs';

const UpdateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  visible: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        id: z.number(),
        price: z.number().optional(),
        is_enabled: z.boolean().optional(),
      }),
    )
    .optional(),
});

// GET /api/admin/printify/products/[productId] - Get product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  return withAdminAuth(async (request: NextRequest) => {
    const requestId = newRequestId();
    const { productId } = await params;

    try {
      const service = getPrintifyService();
      const product = await service.getProduct(productId);

      return NextResponse.json({
        ok: true,
        data: product,
        requestId,
      });
    } catch (error) {
      logger.error('admin_printify_product_fetch_failed', { requestId }, {
        productId,
        error: String(error),
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to fetch product',
          requestId,
        },
        { status: 500 },
      );
    }
  })(req);
}

// PUT /api/admin/printify/products/[productId] - Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  return withAdminAuth(async (request: NextRequest) => {
    const requestId = newRequestId();
    const { productId } = await params;

    try {
      const body = await request.json();
      const validated = UpdateProductSchema.parse(body);

      const service = getPrintifyService();
      // Cast to any since Printify API accepts partial updates
      const product = await service.updateProduct(productId, validated as any);

      logger.info('admin_printify_product_updated', { requestId }, { productId });

      return NextResponse.json({
        ok: true,
        data: product,
        requestId,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Validation error',
            details: error.errors,
            requestId,
          },
          { status: 400 },
        );
      }

      logger.error('admin_printify_product_update_failed', { requestId }, {
        productId,
        error: String(error),
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to update product',
          requestId,
        },
        { status: 500 },
      );
    }
  })(req);
}

// DELETE /api/admin/printify/products/[productId] - Delete product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  return withAdminAuth(async (request: NextRequest) => {
    const requestId = newRequestId();
    const { productId } = await params;

    try {
      const service = getPrintifyService();
      await service.deleteProduct(productId);

      logger.info('admin_printify_product_deleted', { requestId }, { productId });

      return NextResponse.json({
        ok: true,
        data: { success: true },
        requestId,
      });
    } catch (error) {
      logger.error('admin_printify_product_deletion_failed', { requestId }, {
        productId,
        error: String(error),
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to delete product',
          requestId,
        },
        { status: 500 },
      );
    }
  })(req);
}

