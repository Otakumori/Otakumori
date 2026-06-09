import { sendCommerceEmail } from '@/lib/email/service';

export async function sendEmail(to: string, subject: string, html: string) {
  return sendCommerceEmail({
    to,
    subject,
    html,
    template: 'legacy_transactional',
  });
}
