import { env } from '@/env';

export class EmailDisabledError extends Error {}
export async function sendEmail(to: string, subject: string, html: string) {
  const key = (env as any).RESEND_API_KEY,
    from = (env as any).FROM_EMAIL;
  if (!key || !from) throw new EmailDisabledError('Resend not configured');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!r.ok) throw new Error('Email send failed');
  return r.json();
}
