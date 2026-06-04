// lib/email/mailer.ts
import { sendCommerceEmail } from '@/lib/email/service';

export type OrderEmailPayload = {
  to: string;
  orderId: string; // Stripe session id or local order id
  lineItems: Array<{ title: string; qty: number }>;
  customerName?: string;
};

export async function sendOrderConfirmation(p: OrderEmailPayload) {
  const html = orderConfirmHtml(p);
  return sendCommerceEmail({
    to: p.to,
    subject: `We got your order - #${p.orderId}`,
    html,
    template: 'order_confirmation',
    orderId: p.orderId,
  });
}

// Dark, cute, minimal inline HTML (no external CSS)
function orderConfirmHtml({ orderId, lineItems, customerName }: OrderEmailPayload) {
  const items = lineItems
    .map(
      (li) =>
        `<tr><td style="padding:6px 0;">${escapeHtml(li.title)}</td><td align="right" style="padding:6px 0;">x ${li.qty}</td></tr>`,
    )
    .join('');

  return `
  <div style="background:#0a0a0a;color:#f5f5f5;font-family:Inter,system-ui,Arial,sans-serif;padding:24px;">
    <table width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,.08);border-radius:16px;">
      <tr><td style="padding:24px 24px 0;">
        <h1 style="margin:0 0 8px;font-size:20px;line-height:1.3;">Thanks${customerName ? `, ${escapeHtml(customerName)}` : ''}!</h1>
        <p style="margin:0;color:#c9c9c9">We're queuing your items for printing. You'll get tracking when it ships.</p>
        <p style="margin:8px 0 0;color:#c9c9c9">Order <strong>#${escapeHtml(orderId)}</strong></p>
      </td></tr>
      <tr><td style="padding:16px 24px 0;">
        <table width="100%" style="border-collapse:collapse;">${items}</table>
      </td></tr>
      <tr><td style="padding:24px;">
        <p style="margin:0;color:#c9c9c9;font-size:12px;">Otaku-Mori. Small-batch anime-inspired goods.</p>
      </td></tr>
    </table>
  </div>`;
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!,
  );
}
