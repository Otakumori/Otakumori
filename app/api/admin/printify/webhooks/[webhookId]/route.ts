import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { getPrintifyWebhookManager } from '@/app/lib/printify/webhooks';
import { z } from 'zod';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs';

const UpdateWebhookSchema = z.object({
  url: z.string().url().optional(),
  topic: z.string().min(1).optional(),
});

// PUT /api/admin/printify/webhooks/[webhookId] - Update webhook
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> },
) {
  return withAdminAuth(async (request: NextRequest) => {
    const requestId = newRequestId();
    const { webhookId } = await params;

    try {
      const body = await req.json();
      const validated = UpdateWebhookSchema.parse(body);

      const manager = getPrintifyWebhookManager();
      const webhook = await manager.updateWebhook(webhookId, validated);

      logger.info('admin_printify_webhook_updated', { requestId }, { webhookId });

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

      logger.error('admin_printify_webhook_update_failed', { requestId }, {
        webhookId,
        error: String(error),
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to update webhook',
          requestId,
        },
        { status: 500 },
      );
    }
  })(req);
}

// DELETE /api/admin/printify/webhooks/[webhookId] - Delete webhook
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> },
) {
  return withAdminAuth(async (request: NextRequest) => {
    const requestId = newRequestId();
    const { webhookId } = await params;

    try {
      const manager = getPrintifyWebhookManager();
      await manager.deleteWebhook(webhookId);

      logger.info('admin_printify_webhook_deleted', { requestId }, { webhookId });

      return NextResponse.json({
        ok: true,
        data: { success: true },
        requestId,
      });
    } catch (error) {
      logger.error('admin_printify_webhook_deletion_failed', { requestId }, {
        webhookId,
        error: String(error),
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to delete webhook',
          requestId,
        },
        { status: 500 },
      );
    }
  })(req);
}

