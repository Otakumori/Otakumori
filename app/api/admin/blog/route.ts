import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';
import { z } from 'zod';
import { generateRequestId } from '@/app/lib/request-id';
import { createApiError } from '@/app/lib/api-contracts';

// Validation schemas
const BlogPostCreateSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional().nullable(),
  body: z.string(),
  published: z.boolean().optional().default(false),
});

const BlogPostUpdateSchema = BlogPostCreateSchema.extend({
  id: z.string(),
}).partial().required({ id: true });

export const runtime = 'nodejs';

export async function GET() {
  const requestId = generateRequestId();
  
  try {
    await requireAdmin();
    
    const posts = await db.contentPage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({
      ok: true,
      data: posts,
      requestId,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(
        createApiError('FORBIDDEN', error.message, requestId),
        { status: 403 },
      );
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch blog posts', requestId),
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    await requireAdmin();
    const body = await req.json();
    
    const validation = BlogPostCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createApiError(
          'VALIDATION_ERROR',
          'Invalid blog post data',
          requestId,
          validation.error.format(),
        ),
        { status: 400 },
      );
    }
    
    const data = validation.data;
    
    // Check for slug conflicts
    const existing = await db.contentPage.findUnique({
      where: { slug: data.slug },
    });
    
    if (existing) {
      return NextResponse.json(
        createApiError('DUPLICATE_ENTRY', `Slug "${data.slug}" already exists`, requestId),
        { status: 400 },
      );
    }
    
    const post = await db.contentPage.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt || null,
        body: data.body,
        published: data.published ?? false,
      },
    });
    
    return NextResponse.json({
      ok: true,
      data: post,
      requestId,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(
        createApiError('FORBIDDEN', error.message, requestId),
        { status: 403 },
      );
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to create blog post', requestId),
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    await requireAdmin();
    const body = await req.json();
    
    const validation = BlogPostUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createApiError(
          'VALIDATION_ERROR',
          'Invalid blog post data',
          requestId,
          validation.error.format(),
        ),
        { status: 400 },
      );
    }
    
    const { id, ...updateData } = validation.data;
    
    // If slug is being updated, check for conflicts
    if (updateData.slug) {
      const existing = await db.contentPage.findFirst({
        where: { slug: updateData.slug, NOT: { id } },
      });
      
      if (existing) {
        return NextResponse.json(
          createApiError('DUPLICATE_ENTRY', `Slug "${updateData.slug}" already exists`, requestId),
          { status: 400 },
        );
      }
    }
    
    // Convert undefined to null for Prisma
    const prismaData: any = {};
    if (updateData.slug !== undefined) prismaData.slug = updateData.slug;
    if (updateData.title !== undefined) prismaData.title = updateData.title;
    if (updateData.excerpt !== undefined) prismaData.excerpt = updateData.excerpt || null;
    if (updateData.body !== undefined) prismaData.body = updateData.body;
    if (updateData.published !== undefined) prismaData.published = updateData.published;
    
    const post = await db.contentPage.update({
      where: { id },
      data: prismaData,
    });
    
    return NextResponse.json({
      ok: true,
      data: post,
      requestId,
    });
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(
        createApiError('FORBIDDEN', error.message, requestId),
        { status: 403 },
      );
    }
    
    if (error?.code === 'P2025') {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Blog post not found', requestId),
        { status: 404 },
      );
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to update blog post', requestId),
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'ID parameter required', requestId),
        { status: 400 },
      );
    }
    
    await db.contentPage.delete({ where: { id } });
    
    return NextResponse.json({
      ok: true,
      data: { id },
      requestId,
    });
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(
        createApiError('FORBIDDEN', error.message, requestId),
        { status: 403 },
      );
    }
    
    if (error?.code === 'P2025') {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Blog post not found', requestId),
        { status: 404 },
      );
    }
    
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to delete blog post', requestId),
      { status: 500 },
    );
  }
}
