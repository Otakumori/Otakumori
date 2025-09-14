// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/lib/db';

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
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const validated = CreateReviewSchema.parse(body);

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: validated.productId },
    });

    if (!product) {
      return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 });
    }

    // Check if user already reviewed this product
    const existingReview = await db.review.findFirst({
      where: {
        productId: validated.productId,
        userId: userId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { ok: false, error: 'You have already reviewed this product' },
        { status: 400 },
      );
    }

    // Create review
    const review = await db.review.create({
      data: {
        productId: validated.productId,
        userId: userId,
        rating: validated.rating,
        title: validated.title,
        body: validated.body,
        images: validated.images,
        isApproved: false, // Require approval by default
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: review.id,
        message: 'Review submitted for approval',
      },
    });
  } catch (error) {
    console.error('Review creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: false, error: 'Failed to create review' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const approved = searchParams.get('approved') === 'true';

    if (!productId) {
      return NextResponse.json({ ok: false, error: 'Product ID required' }, { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: {
        productId: productId,
        isApproved: approved,
      },
      orderBy: {
        createdAt: 'desc',
      },
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

    return NextResponse.json({
      ok: true,
      data: reviews,
    });
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
