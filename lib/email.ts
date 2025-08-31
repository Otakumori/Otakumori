import { Resend } from 'resend';
import { env } from '@/env.mjs';
import { OrderConfirmationEmail } from '@/app/emails/OrderConfirmation';

const resend = new Resend(env.RESEND_API_KEY);

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export async function sendOrderConfirmation(data: OrderConfirmationData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Otaku-mori <orders@otaku-mori.com>',
      to: [data.customerEmail],
      subject: `Order Confirmation #${data.orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        items: data.items,
        subtotal: data.subtotal,
        shipping: data.shipping,
        total: data.total,
        shippingAddress: data.shippingAddress,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Order confirmation email sent:', emailData?.id);
    return { success: true, emailId: emailData?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
