import { env } from '@/env';
import { db as prisma } from '@/lib/db';
import { resolveCatalogProvider } from '@/lib/catalog/provider';

export interface PrintifyAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  region: string;
  city: string;
  address1: string;
  address2?: string;
  zip: string;
}

export interface PrintifyLineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
}

export interface PrintifyOrderPayload {
  external_id: string;
  line_items: PrintifyLineItem[];
  shipping_method: number;
  send_shipping_notification: boolean;
  address_to: PrintifyAddress;
}

export interface PrintifyOrderResult {
  ok: boolean;
  printifyOrderId?: string;
  status?: string;
  error?: string;
  payload?: unknown;
  response?: unknown;
}

export interface PrintifyFulfillmentOptions {
  /** Failed, provider-rejected submissions may only be retried by an explicit operator action. */
  allowRetry?: boolean;
}

const TERMINAL_SYNC_STATUSES = new Set(['accepted', 'in_production', 'fulfilled', 'shipped']);
const RETRYABLE_SYNC_STATUSES = new Set(['failed', 'mapping_failed', 'no_items']);

function isPendingProviderId(value: string) {
  return /^(pending|failed)_/.test(value);
}

function extractNameParts(fullName?: string | null) {
  const safe = (fullName || '').trim();
  if (!safe) {
    return { firstName: 'Customer', lastName: '' };
  }
  const parts = safe.split(/\s+/);
  return {
    firstName: parts[0] || 'Customer',
    lastName: parts.slice(1).join(' '),
  };
}

export function buildPrintifyAddressFromStripeSession(session: any): PrintifyAddress {
  const shippingName = session?.shipping_details?.name || session?.customer_details?.name || '';
  const { firstName, lastName } = extractNameParts(shippingName);

  return {
    first_name: firstName,
    last_name: lastName,
    email: session?.customer_details?.email || '',
    phone: session?.customer_details?.phone || '',
    country: session?.shipping_details?.address?.country || 'US',
    region: session?.shipping_details?.address?.state || '',
    city: session?.shipping_details?.address?.city || '',
    address1: session?.shipping_details?.address?.line1 || '',
    address2: session?.shipping_details?.address?.line2 || '',
    zip: session?.shipping_details?.address?.postal_code || '',
  };
}

export async function loadPrintifyOrderItems(localOrderId: string) {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: localOrderId },
    orderBy: { createdAt: 'asc' },
    include: {
      Product: true,
      ProductVariant: true,
    },
  });

  const lineItems: PrintifyLineItem[] = [];
  const missingMappings: string[] = [];

  for (const item of orderItems) {
    const provider = resolveCatalogProvider(item.Product);
    const variant = item.ProductVariant;
    if (
      !item.Product.active ||
      !item.Product.visible ||
      provider !== 'printify' ||
      !item.Product.printifyProductId ||
      !variant.isEnabled ||
      !variant.inStock ||
      variant.printifyVariantId == null ||
      !item.printifyProductId ||
      !item.printifyVariantId
    ) {
      missingMappings.push(item.id);
      continue;
    }

    lineItems.push({
      product_id: item.Product.printifyProductId,
      variant_id: variant.printifyVariantId,
      quantity: item.quantity,
    });
  }

  return { orderItems, lineItems, missingMappings };
}

export async function createPrintifyOrder(
  localOrderId: string,
  session: any,
  options: PrintifyFulfillmentOptions = {},
): Promise<PrintifyOrderResult> {
  const existingSync = await prisma.printifyOrderSync.findUnique({
    where: { localOrderId },
  });

  if (existingSync) {
    if (
      TERMINAL_SYNC_STATUSES.has(existingSync.status) ||
      !isPendingProviderId(existingSync.printifyOrderId)
    ) {
      return {
        ok: true,
        printifyOrderId: existingSync.printifyOrderId,
        status: existingSync.status,
      };
    }

    if (existingSync.status === 'submitting' || existingSync.status === 'submission_uncertain') {
      return {
        ok: false,
        error:
          'Printify submission is already in progress or has an uncertain provider outcome; reconcile before retrying.',
      };
    }
  }

  const { lineItems, missingMappings } = await loadPrintifyOrderItems(localOrderId);

  if (missingMappings.length > 0) {
    const error = `Missing Printify mappings for order items: ${missingMappings.join(', ')}`;
    await prisma.printifyOrderSync.upsert({
      where: { localOrderId },
      update: { status: 'mapping_failed', error, lastSyncAt: new Date() },
      create: {
        localOrderId,
        printifyOrderId: `pending_${localOrderId}`,
        status: 'mapping_failed',
        error,
        lastSyncAt: new Date(),
      },
    });
    return { ok: false, error };
  }

  if (lineItems.length === 0) {
    const error = 'No Printify-eligible items found for order';
    await prisma.printifyOrderSync.upsert({
      where: { localOrderId },
      update: { status: 'no_items', error, lastSyncAt: new Date() },
      create: {
        localOrderId,
        printifyOrderId: `pending_${localOrderId}`,
        status: 'no_items',
        error,
        lastSyncAt: new Date(),
      },
    });
    return { ok: false, error };
  }

  if (existingSync) {
    if (!options.allowRetry || !RETRYABLE_SYNC_STATUSES.has(existingSync.status)) {
      return {
        ok: false,
        error: 'Printify fulfillment requires an explicit operator retry.',
      };
    }

    await prisma.printifyOrderSync.update({
      where: { localOrderId },
      data: {
        status: 'submitting',
        error: null,
        lastSyncAt: new Date(),
      },
    });
  } else {
    try {
      await prisma.printifyOrderSync.create({
        data: {
          localOrderId,
          printifyOrderId: `pending_${localOrderId}`,
          status: 'submitting',
          lastSyncAt: new Date(),
        },
      });
    } catch (error) {
      if ((error as { code?: string })?.code === 'P2002') {
        return {
          ok: false,
          error: 'Printify submission is already owned by another request.',
        };
      }
      throw error;
    }
  }

  const payload: PrintifyOrderPayload = {
    external_id: localOrderId,
    line_items: lineItems,
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: buildPrintifyAddressFromStripeSession(session),
  };

  const endpoint = `${env.PRINTIFY_API_URL}/shops/${env.PRINTIFY_SHOP_ID}/orders.json`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Printify submission outcome is uncertain';
    await prisma.printifyOrderSync.update({
      where: { localOrderId },
      data: {
        status: 'submission_uncertain',
        error: message.slice(0, 500),
        lastSyncAt: new Date(),
      },
    });
    return {
      ok: false,
      error:
        'Printify did not return a definitive response; automatic retry is blocked pending reconciliation.',
      payload,
    };
  }

  const responseText = await response.text();
  let parsed: any = null;
  try {
    parsed = responseText ? JSON.parse(responseText) : null;
  } catch {
    parsed = { raw: responseText };
  }

  if (!response.ok) {
    const error =
      typeof parsed?.message === 'string'
        ? parsed.message
        : `Printify order creation failed with ${response.status}`;
    await prisma.printifyOrderSync.update({
      where: { localOrderId },
      data: { status: 'failed', error, lastSyncAt: new Date() },
    });
    return { ok: false, error, payload, response: parsed };
  }

  const printifyOrderId = String(parsed?.id || '');
  const status = String(parsed?.status || 'in_production');

  if (!printifyOrderId) {
    await prisma.printifyOrderSync.update({
      where: { localOrderId },
      data: {
        status: 'submission_uncertain',
        error: 'Printify accepted the request without returning an order ID.',
        lastSyncAt: new Date(),
      },
    });
    return {
      ok: false,
      error: 'Printify response did not include an order ID; reconcile before retrying.',
      payload,
      response: parsed,
    };
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: localOrderId },
      data: {
        printifyId: printifyOrderId,
        status: 'in_production',
      },
    }),
    prisma.printifyOrderSync.update({
      where: { localOrderId },
      data: {
        printifyOrderId,
        status,
        error: null,
        lastSyncAt: new Date(),
      },
    }),
  ]);

  return {
    ok: true,
    printifyOrderId,
    status,
    payload,
    response: parsed,
  };
}
