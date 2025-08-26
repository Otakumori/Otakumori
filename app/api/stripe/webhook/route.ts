import { NextRequest, NextResponse } from "next/server";
import { 
  verifyWebhookSignature, 
  parseWebhookEvent, 
  StripeCheckoutSessionSchema,
  StripePaymentIntentSchema 
} from "@/lib/api/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing Stripe signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  try {
    // Verify webhook signature
    const event = await verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(`Processing Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const session = parseWebhookEvent(event, StripeCheckoutSessionSchema);
        console.log("Checkout completed:", {
          sessionId: session.id,
          customerEmail: session.customer_email,
          amount: session.amount_total,
          status: session.status,
        });
        
        // TODO: Update order status, send confirmation email, etc.
        break;

      case "payment_intent.succeeded":
        const paymentIntent = parseWebhookEvent(event, StripePaymentIntentSchema);
        console.log("Payment succeeded:", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          customer: paymentIntent.customer,
        });
        
        // TODO: Update order status, trigger fulfillment, etc.
        break;

      case "payment_intent.payment_failed":
        const failedPayment = parseWebhookEvent(event, StripePaymentIntentSchema);
        console.log("Payment failed:", {
          paymentIntentId: failedPayment.id,
          amount: failedPayment.amount,
          customer: failedPayment.customer,
        });
        
        // TODO: Send failure notification, update order status, etc.
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    
    if (error instanceof Error && error.message.includes("signature verification failed")) {
      return new NextResponse("Invalid signature", { status: 400 });
    }
    
    return new NextResponse(
      `Webhook error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 400 }
    );
  }
}
