import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { getPrintifyService } from '@/app/lib/printify/service';
import { z } from 'zod';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs';

const CreateProductSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  blueprint_id: z.number(),
  print_provider_id: z.number(),
  variants: z.array(
    z.object({
      id: z.number(),
      price: z.number(),
      is_enabled: z.boolean(),
    }),
  ),
  print_areas: z.array(
    z.object({
      variant_ids: z.array(z.number()),
      placeholders: z.array(
        z.object({
          position: z.string(),
          images: z.array(z.string()),
        }),
      ),
    }),
  ),
  tags: z.array(z.string()).optional(),
  visible: z.boolean().optional(),
});

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

// GET /api/admin/printify/products - List products
export const GET = withAdminAuth(async (req: NextRequest) => {
  const requestId = newRequestId();
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    const service = getPrintifyService();
    const result = await service.getProducts(page, limit);

    return NextResponse.json({
      ok: true,
      data: result,
      requestId,
    });
  } catch (error) {
    logger.error('admin_printify_products_list_failed', { requestId }, { error: String(error) });
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch products',
        requestId,
      },
      { status: 500 },
    );
  }
});

// POST /api/admin/printify/products - Create product
export const POST = withAdminAuth(async (req: NextRequest) => {
  const requestId = newRequestId();

  try {
    const body = await req.json();
    const validated = CreateProductSchema.parse(body);

    const service = getPrintifyService();
    const product = await service.createProduct(validated);

    logger.info('admin_printify_product_created', { requestId }, { productId: product.id });

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

    logger.error('admin_printify_product_creation_failed', { requestId }, { error: String(error) });
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create product',
        requestId,
      },
      { status: 500 },
    );
  }
});

