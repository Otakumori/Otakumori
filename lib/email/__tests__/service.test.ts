import { beforeEach, describe, expect, it, vi } from 'vitest';

const emailLogCreate = vi.fn();
const emailLogUpdate = vi.fn();
const resendSend = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    emailLog: {
      create: emailLogCreate,
      update: emailLogUpdate,
    },
  },
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: resendSend,
    },
  })),
}));

vi.mock('@/env', () => ({
  env: {
    RESEND_API_KEY: 're_test',
    EMAIL_FROM: 'orders@example.test',
    EMAIL_SEND_ENABLED: 'false',
    EMAIL_DRY_RUN: 'true',
  },
}));

describe('commerce email service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    emailLogCreate.mockResolvedValue({ id: 'email_log_123' });
  });

  it('records dry-run email logs without sending through Resend', async () => {
    const { sendCommerceEmail } = await import('@/lib/email/service');

    const result = await sendCommerceEmail({
      to: 'buyer@example.test',
      subject: 'Order confirmation',
      html: '<p>ok</p>',
      template: 'order_confirmation',
      orderId: 'order_123',
    });

    expect(result).toEqual({
      ok: true,
      dryRun: true,
      emailLogId: 'email_log_123',
      providerMessageId: null,
    });
    expect(emailLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          to: 'buyer@example.test',
          status: 'dry_run',
          template: 'order_confirmation',
        }),
      }),
    );
    expect(resendSend).not.toHaveBeenCalled();
    expect(emailLogUpdate).not.toHaveBeenCalled();
  });
});
