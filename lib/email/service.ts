import 'server-only';

import type React from 'react';
import { Resend } from 'resend';
import { env } from '@/env';
import { db } from '@/lib/db';

let resend: Resend | null = null;

export type CommerceEmailPayload = {
  to: string;
  subject: string;
  html?: string;
  react?: React.ReactElement;
  template: string;
  userId?: string | null;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
};

function isTruthy(value?: string | null) {
  return ['1', 'true', 'yes'].includes((value ?? '').trim().toLowerCase());
}

export function isEmailDryRunEnabled() {
  return !env.RESEND_API_KEY || isTruthy(env.EMAIL_DRY_RUN) || !isTruthy(env.EMAIL_SEND_ENABLED);
}

function getResend() {
  if (!resend) resend = new Resend(env.RESEND_API_KEY);
  return resend;
}

function getFromEmail() {
  return env.EMAIL_FROM ?? 'orders@otaku-mori.com';
}

export async function sendCommerceEmail(payload: CommerceEmailPayload) {
  const dryRun = isEmailDryRunEnabled();
  const log = await db.emailLog.create({
    data: {
      userId: payload.userId ?? undefined,
      orderId: payload.orderId ?? undefined,
      to: payload.to,
      provider: 'resend',
      template: payload.template,
      status: dryRun ? 'dry_run' : 'pending',
      meta: {
        subject: payload.subject,
        dryRun,
        ...(payload.metadata ?? {}),
      },
    },
  });

  if (dryRun) {
    return { ok: true, dryRun: true, emailLogId: log.id, providerMessageId: null };
  }

  const result = await getResend().emails.send({
    from: getFromEmail(),
    to: [payload.to],
    subject: payload.subject,
    ...(payload.react ? { react: payload.react } : { html: payload.html ?? '' }),
  });

  if (result.error) {
    await db.emailLog.update({
      where: { id: log.id },
      data: {
        status: 'failed',
        meta: {
          subject: payload.subject,
          dryRun,
          error: result.error.message,
        },
      },
    });
    throw new Error(`Failed to send email: ${result.error.message}`);
  }

  await db.emailLog.update({
    where: { id: log.id },
    data: {
      status: 'sent',
      sentAt: new Date(),
      meta: {
        subject: payload.subject,
        dryRun,
        providerMessageIdPresent: Boolean(result.data?.id),
        ...(payload.metadata ?? {}),
      },
    },
  });

  return { ok: true, dryRun: false, emailLogId: log.id, providerMessageId: result.data?.id ?? null };
}
