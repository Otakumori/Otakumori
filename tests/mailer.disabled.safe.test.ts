import { describe, it, expect } from 'vitest';
import { sendEmail, EmailDisabledError } from '@/src/lib/mailer.safe';

describe('mailer disabled', () => {
  it('throws EmailDisabledError when RESEND_API_KEY is missing', async () => {
    const old = process.env.RESEND_API_KEY;
    delete (process.env as any).RESEND_API_KEY;
    await expect(sendEmail('test@example.com', 'Test', '<p>Test</p>')).rejects.toThrow(
      EmailDisabledError,
    );
    process.env.RESEND_API_KEY = old;
  });

  it('throws EmailDisabledError when FROM_EMAIL is missing', async () => {
    const old = process.env.FROM_EMAIL;
    delete (process.env as any).FROM_EMAIL;
    await expect(sendEmail('test@example.com', 'Test', '<p>Test</p>')).rejects.toThrow(
      EmailDisabledError,
    );
    process.env.FROM_EMAIL = old;
  });
});
