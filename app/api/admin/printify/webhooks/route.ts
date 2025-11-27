import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { getPrintifyWebhookManager } from '@/app/lib/printify/webhooks';
import { z } from 'zod';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs';

const CreateWebhookSchema = z.object({
  url: z.string().url(),
  topic: z.string().min(1),
});

const UpdateWebhookSchema = z.object({
  url: z.string().url().optional(),
  topic: z.string().min(1).optional(),
});

// GET /api/admin/printify/webhooks - List webhooks
export const GET = withAdminAuth(async (req: NextRequest) => {
  const requestId = newRequestId();

  try {
    const manager = getPrintifyWebhookManager();
    const webhooks = await manager.listWebhooks();

    return NextResponse.json({
      ok: true,
      data: webhooks,
      requestId,
    });
  } catch (error) {
    logger.error('admin_printify_webhooks_list_failed', { requestId }, { error: String(error) });
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch webhooks',
        requestId,
      },
      { status: 500 },
    );
  }
});

// POST /api/admin/printify/webhooks - Create webhook
export const POST = withAdminAuth(async (req: NextRequest) => {
  const requestId = newRequestId();

  try {
    const body = await req.json();
    const validated = CreateWebhookSchema.parse(body);

    const manager = getPrintifyWebhookManager();
    const webhook = await manager.createWebhook(validated.url, validated.topic);

    logger.info('admin_printify_webhook_created', { requestId }, { webhookId: webhook.id });

    return NextResponse.json({
      ok: true,
      data: webhook,
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

    logger.error('admin_printify_webhook_creation_failed', { requestId }, { error: String(error) });
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create webhook',
        requestId,
      },
      { status: 500 },
    );
  }
});

