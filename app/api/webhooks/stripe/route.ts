import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db as prisma } from "@/lib/db";

export const runtime = "nodejs";      // needed for crypto, raw body
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

async function saveEventOnce(id: string, type: string, payload: any) {
  try {
    await prisma.webhookEvent.create({ data: { id, type, payload } });
    return true;
  } catch {
    return false; // already processed
  }
}

// Helper: find user from session
async function resolveUser(session: Stripe.Checkout.Session) {
  // 1) Preferred: map via StripeCustomer (customer id)
  if (session.customer && typeof session.customer === "string") {
    const sc = await prisma.stripeCustomer.findUnique({
      where: { customerId: session.customer },
      include: { user: true },
    });
    if (sc?.user) return sc.user;
  }
  // 2) Fallback: you should pass Clerk's userId into client_reference_id when creating the session
  if (session.client_reference_id) {
    return prisma.user.findFirst({ where: { clerkId: session.client_reference_id } });
  }
  return null;
}

// Read raw body for signature verification
async function readRawBody(req: Request) {
  return await req.text();
}

export async function POST(req: Request) {
  const sig = headers().get("stripe-signature");
  if (!sig) return new NextResponse("Missing Stripe-Signature", { status: 400 });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new NextResponse("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });

  const raw = await readRawBody(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // Idempotency guard
  const firstTime = await saveEventOnce(event.id, event.type, event.data?.object ?? {});
  if (!firstTime) return NextResponse.json({ ok: true, duplicate: true });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get line items (to know if it's a petal pack, etc.)
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price.product"],
      });

      const user = await resolveUser(fullSession);
      if (!user) return NextResponse.json({ ok: true, note: "no-user" });

      // Compute order totals
      const total = fullSession.amount_total ?? 0;
      const currency = fullSession.currency ?? "usd";
      const paymentIntentId = typeof fullSession.payment_intent === "string" ? fullSession.payment_intent : null;

      // Create or update Order using existing model
      const order = await prisma.order.upsert({
        where: { stripeId: fullSession.id },
        update: { 
          status: "shipped", // using existing enum value
          paymentIntentId: paymentIntentId ?? undefined, 
          totalAmount: total, 
          currency: currency.toUpperCase(),
          paidAt: new Date(),
        },
        create: {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          stripeId: fullSession.id,
          paymentIntentId: paymentIntentId ?? undefined,
          totalAmount: total,
          currency: currency.toUpperCase(),
          status: "shipped", // using existing enum value
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Detect petal packs by price/product metadata
      // Set metadata on Stripe dashboard (e.g., price.metadata.petal_amount = "1000")
      let petalToCredit = 0;
      fullSession.line_items?.data.forEach((item) => {
        const price = item.price;
        const meta = price?.metadata ?? (price?.product && (price.product as Stripe.Product).metadata) ?? {};
        const str = (meta as any)["petal_amount"];
        if (str) petalToCredit += parseInt(str, 10) * (item.quantity ?? 1);
      });

      if (petalToCredit > 0) {
        // Credit petals to user's wallet
        await prisma.wallet.upsert({
          where: { userId: user.id },
          update: { petals: { increment: petalToCredit } },
          create: { userId: user.id, petals: petalToCredit, runes: 0 },
        });

        // Create ledger entry
        await prisma.petalLedger.create({
          data: {
            userId: user.id,
            type: "earn",
            amount: petalToCredit,
            reason: "PETAL_PACK_CREDIT",
          },
        });
      }

      return NextResponse.json({ ok: true });
    }

    case "charge.refunded":
    case "charge.dispute.funds_withdrawn": {
      // Handle refunds / disputes → negative ledger + status update
      const obj: any = event.data.object;
      const paymentIntentId = obj.payment_intent ?? obj.id ?? null;
      if (!paymentIntentId) return NextResponse.json({ ok: true });

      const order = await prisma.order.findFirst({
        where: { paymentIntentId: paymentIntentId },
        include: { User: true },
      });
      if (!order?.User) return NextResponse.json({ ok: true });

      // Update order status to cancelled for refunds
      await prisma.order.update({ 
        where: { id: order.id }, 
        data: { status: "cancelled" } 
      });

      return NextResponse.json({ ok: true });
    }

    case "customer.created": {
      const customer = event.data.object as Stripe.Customer;
      const clerkId = (customer.metadata?.clerkId as string | undefined) ?? undefined;
      if (!clerkId) return NextResponse.json({ ok: true });

      const user = await prisma.user.findFirst({ where: { clerkId } });
      if (!user) return NextResponse.json({ ok: true });

      // upsert link
      await prisma.stripeCustomer.upsert({
        where: { userId: user.id },
        update: { customerId: customer.id },
        create: { userId: user.id, customerId: customer.id },
      });
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ ok: true, ignored: event.type });
  }
}