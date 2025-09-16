// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { problem } from '@/lib/http/problem';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

const CreateReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().min(1),
      }),
    )
    .optional()
    .default([]),
});

export async function POST(req: NextRequest) {
  const logger = await getLogger();
  logger.request(req, 'POST /api/reviews');
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(problem(401, 'Authentication required'), { status: 401 });
    }
    
    const db = await getDb();

    const body = await req.json().catch(() => null);
    const validated = CreateReviewSchema.parse(body);

    const product = await db.product.findUnique({ where: { id: validated.productId } });
    if (!product) {
      return NextResponse.json(problem(404, 'Product not found'), { status: 404 });
    }

    const existingReview = await db.review.findFirst({
      where: { productId: validated.productId, userId },
    });
    if (existingReview) {
      return NextResponse.json(problem(400, 'Already reviewed'), { status: 400 });
    }

    const review = await db.review.create({
      data: {
        productId: validated.productId,
        userId,
        rating: validated.rating,
        title: validated.title,
        body: validated.body,
        images: validated.images,
        isApproved: false,
      },
    });

    return NextResponse.json({
      ok: true,
      data: { id: review.id, message: 'Review submitted for approval' },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(problem(400, 'Invalid input data'), { status: 400 });
    }
    logger.error(
      'reviews_post_error',
      { route: '/api/reviews' },
      { error: String(error?.message || error) },
    );
    return NextResponse.json(problem(500, 'Failed to create review'), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const logger = await getLogger();
  logger.request(req, 'GET /api/reviews');
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const approved = searchParams.get('approved') === 'true';
    if (!productId) {
      return NextResponse.json(problem(400, 'Product ID required'), { status: 400 });
    }
    const db = await getDb();
    const reviews = await db.review.findMany({
      where: { productId, isApproved: approved },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        rating: true,
        title: true,
        body: true,
        images: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, data: reviews });
  } catch (error: any) {
    const logger = await getLogger();
    logger.error(
      'reviews_get_error',
      { route: '/api/reviews' },
      { error: String(error?.message || error) },
    );
    return NextResponse.json(problem(500, 'Failed to fetch reviews'), { status: 500 });
  }
}
