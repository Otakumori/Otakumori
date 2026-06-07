import { describe, expect, it, vi } from 'vitest';

const sendCommerceEmailMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/email/service', () => ({
  sendCommerceEmail: sendCommerceEmailMock,
}));

import { sendEmail } from '@/app/lib/mailer';

describe('legacy mailer compatibility', () => {
  it('delegates to the branded dry-run-first email service', async () => {
    sendCommerceEmailMock.mockResolvedValue({
      ok: true,
      dryRun: true,
      emailLogId: 'email_log_test',
      providerMessageId: null,
    });

    await sendEmail('recipient@example.test', 'Subject', '<p>Body</p>');

    expect(sendCommerceEmailMock).toHaveBeenCalledWith({
      to: 'recipient@example.test',
      subject: 'Subject',
      html: '<p>Body</p>',
      template: 'legacy_transactional',
    });
  });
});
