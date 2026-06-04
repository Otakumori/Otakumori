import { OrderConfirmationEmail } from '@/app/emails/OrderConfirmation';
import { sendCommerceEmail } from '@/lib/email/service';

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
    const emailData = await sendCommerceEmail({
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderNumber}`,
      template: 'order_confirmation',
      react: OrderConfirmationEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        items: data.items,
        subtotal: data.subtotal,
        shipping: data.shipping,
        total: data.total,
        shippingAddress: data.shippingAddress,
      }),
      metadata: { orderNumber: data.orderNumber },
    });

    return { success: true, emailId: emailData.providerMessageId, dryRun: emailData.dryRun };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
