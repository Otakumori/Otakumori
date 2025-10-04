import { sendEmail } from './mailer.safe';

export async function sendOrderConfirmation(
  to: string,
  data: { orderId: string; total: number; currency: string },
) {
  const html = `
    <h1>Thanks for your order </h1>
    <p>Order: <strong>${data.orderId}</strong></p>
    <p>Total: ${data.total.toFixed(2)} ${data.currency}</p>
    <p>We'll email tracking once it ships.</p>`;
  return sendEmail(to, 'Your Otaku-mori order', html);
}
