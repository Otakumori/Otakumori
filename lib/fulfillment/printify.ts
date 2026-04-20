import { env } from '@/env';
import { db as prisma } from '@/lib/db';

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
  });

  const lineItems: PrintifyLineItem[] = [];
  const missingMappings: string[] = [];

  for (const item of orderItems) {
    if (!item.printifyProductId || !item.printifyVariantId) {
      missingMappings.push(item.id);
      continue;
    }

    lineItems.push({
      product_id: item.printifyProductId,
      variant_id: item.printifyVariantId,
      quantity: item.quantity,
    });
  }

  return { orderItems, lineItems, missingMappings };
}

export async function createPrintifyOrder(localOrderId: string, session: any): Promise<PrintifyOrderResult> {
  const { lineItems, missingMappings } = await loadPrintifyOrderItems(localOrderId);

  if (missingMappings.length > 0) {
    const error = `Missing Printify mappings for order items: ${missingMappings.join(', ')}`;
    await prisma.printifyOrderSync.upsert({
      where: { localOrderId },
      update: { status: 'mapping_failed', error, lastSyncAt: new Date() },
      create: { localOrderId, printifyOrderId: `pending_${localOrderId}`, status: 'mapping_failed', error, lastSyncAt: new Date() },
    });
    return { ok: false, error };
  }

  if (lineItems.length === 0) {
    const error = 'No Printify-eligible items found for order';
    await prisma.printifyOrderSync.upsert({
      where: { localOrderId },
      update: { status: 'no_items', error, lastSyncAt: new Date() },
      create: { localOrderId, printifyOrderId: `pending_${localOrderId}`, status: 'no_items', error, lastSyncAt: new Date() },
    });
    return { ok: false, error };
  }

  const payload: PrintifyOrderPayload = {
    external_id: localOrderId,
    line_items: lineItems,
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: buildPrintifyAddressFromStripeSession(session),
  };

  const endpoint = `${env.PRINTIFY_API_URL}/shops/${env.PRINTIFY_SHOP_ID}/orders.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let parsed: any = null;
  try {
    parsed = responseText ? JSON.parse(responseText) : null;
  } catch {
    parsed = { raw: responseText };
  }

  if (!response.ok) {
    const error = typeof parsed?.message === 'string' ? parsed.message : `Printify order creation failed with ${response.status}`;
    await prisma.printifyOrderSync.upsert({
      where: { localOrderId },
      update: { status: 'failed', error, lastSyncAt: new Date() },
      create: { localOrderId, printifyOrderId: `failed_${localOrderId}`, status: 'failed', error, lastSyncAt: new Date() },
    });
    return { ok: false, error, payload, response: parsed };
  }

  const printifyOrderId = String(parsed?.id || '');
  const status = String(parsed?.status || 'in_production');

  await prisma.order.update({
    where: { id: localOrderId },
    data: {
      printifyId: printifyOrderId || undefined,
      status: 'in_production',
    },
  });

  await prisma.printifyOrderSync.upsert({
    where: { localOrderId },
    update: {
      printifyOrderId: printifyOrderId || `accepted_${localOrderId}`,
      status,
      error: null,
      lastSyncAt: new Date(),
    },
    create: {
      localOrderId,
      printifyOrderId: printifyOrderId || `accepted_${localOrderId}`,
      status,
      lastSyncAt: new Date(),
    },
  });

  return {
    ok: true,
    printifyOrderId,
    status,
    payload,
    response: parsed,
  };
}
