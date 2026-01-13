import { inngest } from './client';
import { db } from '@/lib/db';
import { getPrintifyService } from '@/app/lib/printify/service';
import type { PrintifyOrderData, PrintifyShippingAddress } from '@/app/lib/printify';
import { logger } from '@/app/lib/logger';

/**
 * Handle order fulfillment after successful payment
 * Triggered by: order/fulfilled event from Stripe webhook
 */
export const fulfillOrder = inngest.createFunction(
  {
    id: 'fulfill-order',
    name: 'Fulfill Order',
  },
  { event: 'order/fulfilled' },
  async ({ event, step }) => {
    const { orderId, userId, stripeSessionId, shippingDetails, email } = event.data;

    // Step 1: Validate order
    const order = await step.run('validate-order', async () => {
      const orderData = await db.order.findUnique({
        where: { id: orderId },
        include: {
          OrderItem: {
            include: {
              Product: true,
              ProductVariant: true,
            },
          },
          User: {
            select: {
              id: true,
              email: true,
              displayName: true,
              username: true,
            },
          },
        },
      });

      if (!orderData) {
        throw new Error(`Order not found: ${orderId}`);
      }

      if (orderData.status !== 'pending' && orderData.status !== 'pending_mapping') {
        throw new Error(`Order not paid: ${orderId}, status: ${orderData.status}`);
      }

      if (userId && orderData.userId !== userId) {
        throw new Error(
          `Order ${orderId} is associated with user ${orderData.userId}, but event user ${userId} was provided.`,
        );
      }

      if (stripeSessionId && orderData.stripeId !== stripeSessionId) {
        console.warn(
          `Stripe session mismatch for order ${orderId}: expected ${orderData.stripeId}, received ${stripeSessionId}`,
        );
      }

      return orderData;
    });

    // Step 2: Create Printify order
    const printifyOrder = await step.run('create-printify-order', async () => {
      try {
        // Parse shipping address
        const address = shippingDetails?.address || {};
        const shippingAddress: PrintifyShippingAddress = {
          first_name: shippingDetails?.name?.split(' ')[0] || order.User.displayName || 'Customer',
          last_name: shippingDetails?.name?.split(' ').slice(1).join(' ') || 'Name',
          email: email || order.User.email || 'customer@example.com',
          country: address.country || 'US',
          region: address.state || 'CA',
          city: address.city || 'Unknown',
          zip: address.postal_code || '00000',
          address1: address.line1 || 'Address not provided',
          address2: address.line2 || '',
        };

        const printifyOrderData: PrintifyOrderData = {
          external_id: order.id,
          label: `Order #${order.displayNumber}`,
          line_items: order.OrderItem.map((item) => ({
            printify_product_id: item.printifyProductId || '',
            printify_variant_id: String(item.printifyVariantId || 0),
            quantity: item.quantity,
          })),
          shipping_method: 1, // Standard shipping
          send_shipping_notification: true,
          address_to: shippingAddress,
        };

        // Create order in Printify using real API
        const printify = getPrintifyService();
        const result = await printify.createOrder(printifyOrderData);

        // Update order with Printify ID and status
        await db.order.update({
          where: { id: order.id },
          data: {
            printifyId: result.id,
            status: 'in_production',
          },
        });

        // Create or update PrintifyOrderSync record
        await db.printifyOrderSync.upsert({
          where: { localOrderId: order.id },
          create: {
            localOrderId: order.id,
            printifyOrderId: result.id,
            status: 'synced',
            lastSyncAt: new Date(),
          },
          update: {
            printifyOrderId: result.id,
            status: 'synced',
            lastSyncAt: new Date(),
            error: null,
          },
        });

        logger.info('Printify order created and synced', undefined, {
          orderId: order.id,
          printifyOrderId: result.id,
          status: result.status,
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        logger.error('Failed to create Printify order', undefined, {
          orderId: order.id,
          error: errorMessage,
        }, error instanceof Error ? error : new Error(errorMessage));

        // Update order status to indicate fulfillment failure
        await db.order.update({
          where: { id: order.id },
          data: {
            status: 'cancelled',
          },
        });

        // Log failure to PrintifyOrderSync
        await db.printifyOrderSync.upsert({
          where: { localOrderId: order.id },
          create: {
            localOrderId: order.id,
            printifyOrderId: 'failed',
            status: 'failed',
            error: errorMessage.substring(0, 500), // Limit error length
            lastSyncAt: new Date(),
          },
          update: {
            status: 'failed',
            error: errorMessage.substring(0, 500),
            lastSyncAt: new Date(),
          },
        });

        throw error;
      }
    });

    // Step 3: Send order confirmation email
    await step.run('send-confirmation-email', async () => {
      await inngest.send({
        name: 'email/order-confirmation',
        data: {
          userId: order.userId,
          orderId: order.id,
          email: email || order.User.email,
          stripeSessionId: stripeSessionId ?? order.stripeId,
          orderNumber: order.displayNumber,
          totalAmount: order.totalAmount,
          items: order.OrderItem.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.unitAmount,
          })),
        },
      });
    });

    // Step 4: Clear user's cart
    await step.run('clear-cart', async () => {
      await db.cartItem.deleteMany({
        where: { Cart: { userId: order.userId } },
      });
    });

    return {
      success: true,
      orderId: order.id,
      printifyOrderId: printifyOrder.id,
      status: 'fulfilled',
      timestamp: new Date().toISOString(),
    };
  },
);

/**
 * Award petals for purchase
 * Triggered by: petals/award-purchase-bonus event
 */
export const awardPurchasePetals = inngest.createFunction(
  {
    id: 'award-purchase-petals',
    name: 'Award Purchase Petals',
  },
  { event: 'petals/award-purchase-bonus' },
  async ({ event, step }) => {
    const { userId, orderId, amountCents, stripeSessionId } = event.data;

    return await step.run('award-petals', async () => {
      try {
        // Calculate petals: 1 petal per dollar spent
        const petalsToAward = Math.floor(amountCents / 100);

        if (petalsToAward <= 0) {
          return { success: true, awarded: 0, reason: 'Amount too small' };
        }

        // Award petals using centralized grantPetals
        const { grantPetals } = await import('@/app/lib/petals/grant');
        const result = await grantPetals({
          userId,
          amount: petalsToAward,
          source: 'purchase_reward',
          metadata: {
            orderId,
            amountCents,
            stripeSessionId,
          },
          description: `Purchase bonus for order ${orderId}`,
          // Note: No req object in Inngest context, rate limiting handled by Inngest retries
        });

        if (!result.success) {
          console.error(`Failed to award purchase petals: ${result.error}`);
          return {
            success: false,
            error: result.error || 'Failed to award petals',
            stripeSessionId: stripeSessionId ?? null,
          };
        }

        console.warn(`Awarded ${result.granted} petals to user ${userId} for order ${orderId}`);

        return {
          success: true,
          awarded: result.granted,
          newBalance: result.newBalance,
          lifetimeEarned: result.lifetimeEarned,
          stripeSessionId: stripeSessionId ?? null,
        };
      } catch (error) {
        console.error('Failed to award purchase petals:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          stripeSessionId: stripeSessionId ?? null,
        };
      }
    });
  },
);

/**
 * Deduct petals for refund
 * Triggered by: petals/deduct-refund event
 */
export const deductRefundPetals = inngest.createFunction(
  {
    id: 'deduct-refund-petals',
    name: 'Deduct Refund Petals',
  },
  { event: 'petals/deduct-refund' },
  async ({ event, step }) => {
    const { userId, orderId, amountCents } = event.data;

    return await step.run('deduct-petals', async () => {
      try {
        // Calculate petals to deduct
        const petalsToDeduct = Math.floor(amountCents / 100);

        if (petalsToDeduct <= 0) {
          return { success: true, deducted: 0, reason: 'Amount too small' };
        }

        // Deduct petals
        await db.petalLedger.create({
          data: {
            User: { connect: { id: userId } },
            type: 'adjust',
            amount: -petalsToDeduct,
            reason: 'Refund deduction',
          },
        });

        // Get new balance
        const balance = await db.petalLedger.aggregate({
          where: { userId },
          _sum: { amount: true },
        });

        console.log(`Deducted ${petalsToDeduct} petals from user ${userId} for refund ${orderId}`);

        return {
          success: true,
          deducted: petalsToDeduct,
          newBalance: balance._sum.amount || 0,
        };
      } catch (error) {
        console.error('Failed to deduct refund petals:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });
  },
);

/**
 * Send order confirmation email
 * Triggered by: email/order-confirmation event
 */
export const sendOrderConfirmationEmail = inngest.createFunction(
  {
    id: 'send-order-confirmation-email',
    name: 'Send Order Confirmation Email',
  },
  { event: 'email/order-confirmation' },
  async ({ event, step }) => {
    const { orderId, email, orderNumber, totalAmount, items, userId } = event.data;

    return await step.run('send-email', async () => {
      try {
        // Fetch full order data from database
        const order = await db.order.findUnique({
          where: { id: orderId },
          include: {
            User: {
              select: { email: true, displayName: true, username: true },
            },
            OrderItem: {
              include: {
                Product: {
                  select: { name: true, primaryImageUrl: true },
                },
                ProductVariant: {
                  select: { previewImageUrl: true },
                },
              },
            },
          },
        });

        if (!order) {
          throw new Error(`Order ${orderId} not found`);
        }
        
        const recipientEmail = email || order.User?.email || 'customer@example.com';
        const recipientName = order.User?.displayName || order.User?.username || 'Customer';
        
        // Prepare email data
        const emailData = {
          orderNumber: orderNumber || order.displayNumber || order.id,
          customerName: recipientName,
          customerEmail: recipientEmail,
          items: order.OrderItem.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.unitAmount,
            imageUrl: (item.Product as any)?.primaryImageUrl || (item.ProductVariant as any)?.previewImageUrl,
          })),
          subtotal: order.subtotalCents || (order.OrderItem as any[]).reduce((sum: number, item: any) => sum + (item.unitAmount * item.quantity), 0),
          shipping: 0, // Shipping amount not stored separately in Order model, can be calculated if needed
          total: order.totalAmount,
          shippingAddress: {
            name: recipientName,
            line1: 'Address information', // Shipping address not stored in Order model
            line2: undefined,
            city: 'City',
            state: 'State',
            postalCode: '00000',
            country: 'US',
          },
        };

        // Import and use Resend email function
        const { sendOrderConfirmation } = await import('@/lib/email');
        const result = await sendOrderConfirmation(emailData);

        // Log email sent (EmailLog table exists)
        try {
          await db.emailLog.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              to: recipientEmail,
              provider: 'resend',
              template: 'order-confirmation',
              status: 'sent',
              sentAt: new Date(),
            },
          });
        } catch (logError) {
          // Logging failure shouldn't break email sending
          logger.warn('Failed to log email to EmailLog', undefined, undefined);
        }

        logger.info('Order confirmation email sent', undefined, {
          orderId,
          orderNumber: emailData.orderNumber,
          recipientEmail,
          emailId: result.emailId,
        });

        return {
          success: true,
          email: recipientEmail,
          orderId,
          orderNumber: emailData.orderNumber,
          emailId: result.emailId,
        };
      } catch (error) {
        console.error('Failed to send order confirmation email:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });
  },
);

/**
 * Send payment failed email
 * Triggered by: email/payment-failed event
 */
export const sendPaymentFailedEmail = inngest.createFunction(
  {
    id: 'send-payment-failed-email',
    name: 'Send Payment Failed Email',
  },
  { event: 'email/payment-failed' },
  async ({ event, step }) => {
    const { orderId, email, userId, reason } = event.data;

    return await step.run('send-email', async () => {
      try {
        // Fetch user data if userId provided
        let userData = null;
        if (userId) {
          userData = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, displayName: true },
          });
        }
        
        const recipientEmail = email || userData?.email || 'customer@example.com';
        
        console.log('Sending payment failed email:', {
          to: recipientEmail,
          orderId,
          userId,
          reason,
        });

        // TODO: Integrate with email service
        // await emailService.send({
        //   to: email,
        //   template: 'payment-failed',
        //   data: { orderId, reason },
        // });

        return {
          success: true,
          email,
          orderId,
        };
      } catch (error) {
        console.error('Failed to send payment failed email:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });
  },
);
