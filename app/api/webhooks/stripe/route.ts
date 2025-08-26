/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { sendOrderConfirmation } from '@/lib/email/mailer';

export const runtime = "nodejs"; // ensure Node runtime for raw body
export const preferredRegion = ["iad1"]; // optional: pick your region

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") || "";
  const body = await req.text(); // raw body required for verification

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new Response(`Signature error: ${err.message}`, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Parse metadata (you should set this at /api/checkout creation)
    const itemsRaw = (session.metadata?.items ?? "[]");
    const items: Array<{ product_id: string; variant_id: number; quantity: number; title?: string }> = JSON.parse(itemsRaw);
    const email = session.customer_details?.email || session.customer_email || "";
    const name = session.customer_details?.name || undefined;

    // Minimal address (adjust to your checkout collection)
    const address = {
      first_name: (name || "").split(" ").slice(0, -1).join(" ") || "Friend",
      last_name: (name || "").split(" ").slice(-1).join(" ") || "of Mori",
      email,
      address1: session.customer_details?.address?.line1 || "",
      address2: session.customer_details?.address?.line2 || "",
      city: session.customer_details?.address?.city || "",
      region: session.customer_details?.address?.state || "",
      country: session.customer_details?.address?.country || "",
      zip: session.customer_details?.address?.postal_code || "",
      phone: session.customer_details?.phone || "",
    };

    try {
      // 1) Create/ensure Printify order (idempotent by Stripe session id)
      await createPrintifyOrder({
        externalId: session.id!,
        items,
        address,
      });

      // 2) Send branded confirmation via Resend (non-blocking if it fails)
      if (email) {
        const lineItemsForEmail = items.map(i => ({ title: i.title || `Item ${i.variant_id}`, qty: i.quantity }));
        await sendOrderConfirmation({ to: email, orderId: session.id!, lineItems: lineItemsForEmail, customerName: name });
      }
    } catch (err: any) {
      // Log error, but acknowledge webhook to avoid Stripe retry spam.
      console.error("Webhook error:", err?.message || err);
    }
  }

  return new Response("ok", { status: 200 });
}



async function createPrintifyOrder(opts: {
  externalId: string;                  // idempotency
  items: Array<{ product_id: string; variant_id: number; quantity: number; title?: string }>;
  address: {
    first_name: string; last_name: string; email: string;
    address1: string; address2?: string; city: string; region?: string;
    country: string; zip: string; phone?: string;
  };
}) {
  const url = `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`;
  const body = {
    external_id: opts.externalId,
    label: "Otaku-Mori Order",
    line_items: opts.items.map(i => ({ product_id: i.product_id, variant_id: i.variant_id, quantity: i.quantity })),
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: opts.address,
  };

  // simple retry/backoff for 429/5xx
  let lastErr: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PRINTIFY_API_KEY!}`,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) return await res.json();
    if (res.status === 409) return await res.json(); // already exists (idempotent)
    if (res.status >= 500 || res.status === 429) {
      await new Promise(r => setTimeout(r, 500 * (attempt + 1) ** 2));
      lastErr = await safeJson(res);
      continue;
    }
    const err = await safeJson(res);
    throw new Error(`Printify error ${res.status}: ${JSON.stringify(err)}`);
  }
  throw new Error(`Printify retry failed: ${JSON.stringify(lastErr)}`);
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return { status: res.status, text: await res.text() }; }
}
