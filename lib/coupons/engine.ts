export type CartItemInput = {
  id: string;
  productId?: string | null;
  collectionIds?: string[] | null;
  quantity: number;
  unitPrice: number; // dollars
};

export type ShippingInput = {
  provider?: 'stripe' | 'flat' | 'other';
  fee: number; // dollars
};

export type CouponMeta = {
  code: string;
  type: 'PERCENT' | 'FIXED' | 'FREESHIP';
  valueCents: number; // for FIXED, dollars*100; for PERCENT, percent*100? No: store percent in 0..100 as integer but we standardize to valuePct for percent
  valuePct?: number; // 0..100 for percent coupons
  enabled: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number | null;
  minSubtotalCents?: number | null;
  allowedProductIds?: string[];
  excludedProductIds?: string[];
  allowedCollections?: string[];
  excludedCollections?: string[];
  stackable?: boolean;
  oneTimeCode?: boolean;
};

export type EngineInput = {
  userId?: string | null;
  now: Date;
  items: CartItemInput[];
  shipping?: ShippingInput | null;
  coupons: CouponMeta[]; // normalized metadata looked up by code
  // Usage context (optional) for per-user/global caps
  usage?: {
    byCode: Record<string, { total: number; perUser: number }>; // current usage tallies
  };
  codesOrder?: string[]; // the order codes were entered; otherwise iterate coupons array order
  minSubtotalCentsOverride?: number | null; // for testing
};

export type CouponBreakdown = {
  codesApplied: { code: string; type: 'PERCENT' | 'FIXED' | 'FREESHIP'; amount: number }[]; // amounts in dollars
  lineItemAdjustments: { lineId: string; discount: number }[];
  shippingDiscount: number; // dollars
  subtotalBefore: number; // dollars
  subtotalAfter: number; // dollars
  discountTotal: number; // dollars
  messages: string[];
  normalizedCodes: string[];
};

export function normalizeCode(code: string): string {
  return (code || '').trim().toUpperCase();
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// cents helpers (half-up rounding)
function toCents(n: number): number {
  return Math.round(n * 100);
}
function dollars(cents: number): number {
  return Math.round(cents) / 100;
}

function isActive(now: Date, startsAt?: Date | null, endsAt?: Date | null): boolean {
  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;
  return true;
}

function eligibleItemSubtotalCents(item: CartItemInput, c: CouponMeta): number {
  const allowedP = (c.allowedProductIds ?? []).length > 0 ? c.allowedProductIds : null;
  const excludedP = (c.excludedProductIds ?? []).length > 0 ? c.excludedProductIds : null;
  const allowedC = (c.allowedCollections ?? []).length > 0 ? c.allowedCollections : null;
  const excludedC = (c.excludedCollections ?? []).length > 0 ? c.excludedCollections : null;

  const productAllowed = allowedP ? !!(item.productId && allowedP.includes(item.productId)) : true;
  const productExcluded = excludedP
    ? !!(item.productId && excludedP.includes(item.productId))
    : false;

  const colSet = new Set(item.collectionIds ?? []);
  const inAllowedCol = allowedC ? allowedC.some((id) => colSet.has(id)) : true;
  const inExcludedCol = excludedC ? excludedC.some((id) => colSet.has(id)) : false;

  const ok = productAllowed && !productExcluded && inAllowedCol && !inExcludedCol;
  if (!ok) return 0;
  return toCents(item.unitPrice) * item.quantity;
}

export function getApplicableCoupons(input: EngineInput): CouponBreakdown {
  const messages: string[] = [];
  const normalizedCodes = (input.codesOrder ?? input.coupons.map((c) => c.code)).map(normalizeCode);
  const itemsCents = input.items.map((i) => ({
    id: i.id,
    cents: toCents(i.unitPrice) * i.quantity,
  }));
  const subtotalCents = itemsCents.reduce((s, it) => s + it.cents, 0);

  let runningSubtotalCents = subtotalCents;
  let shippingDiscountCents = 0;
  const codesApplied: {
    code: string;
    type: 'PERCENT' | 'FIXED' | 'FREESHIP';
    amountCents: number;
  }[] = [];
  const lineItemAdjustments: { lineId: string; discount: number }[] = []; // reserved (future)

  // Basic validations and selection
  const now = input.now ?? new Date();
  const userId = input.userId ?? null;

  // Build code -> meta map
  const cmap: Record<string, CouponMeta> = {};
  for (const c of input.coupons) cmap[normalizeCode(c.code)] = c;

  // Determine stackability rule
  const selectedCodes: string[] = [];
  for (const code of normalizedCodes) {
    const c = cmap[code];
    if (!c) {
      messages.push(`coupon.not_found:${code}`);
      continue;
    }
    if (!c.enabled || !isActive(now, c.startsAt ?? null, c.endsAt ?? null)) {
      messages.push(`coupon.inactive:${code}`);
      continue;
    }
    // Usage caps (requires input.usage tallies)
    const tallies = input.usage?.byCode?.[code];
    if (typeof c.maxRedemptions === 'number' && tallies && tallies.total >= c.maxRedemptions) {
      messages.push(`coupon.exhausted:${code}`);
      continue;
    }
    if (
      userId &&
      typeof c.maxRedemptionsPerUser === 'number' &&
      tallies &&
      tallies.perUser >= c.maxRedemptionsPerUser
    ) {
      messages.push(`coupon.user_cap:${code}`);
      continue;
    }

    // Min subtotal
    const minSub = c.minSubtotalCents ?? null;
    if (minSub && subtotalCents < minSub) {
      messages.push(`coupon.min_subtotal:${code}`);
      continue;
    }

    // If default single-code only and not all are stackable, enforce first wins
    if (selectedCodes.length > 0) {
      const allStackable = selectedCodes.every((sc) => cmap[sc]?.stackable) && !!c.stackable;
      if (!allStackable) {
        messages.push(`coupon.not_stackable:${code}`);
        continue;
      }
    }

    selectedCodes.push(code);
  }

  // Apply coupons in order to eligible portions
  for (const code of selectedCodes) {
    const c = cmap[code];
    if (!c) continue;

    if (c.type === 'FREESHIP') {
      const shipping = input.shipping;
      if (shipping && (shipping.provider === 'stripe' || shipping.provider === 'flat')) {
        const feeCents = toCents(shipping.fee);
        if (feeCents > 0) {
          const applied = feeCents; // capped at fee amount
          shippingDiscountCents += applied;
          codesApplied.push({ code, type: 'FREESHIP', amountCents: applied });
        } else {
          messages.push(`coupon.no_shipping_fee:${code}`);
        }
      } else {
        messages.push(`coupon.unsupported_shipping:${code}`);
      }
      continue;
    }

    // Compute eligible subtotal for this coupon
    let eligibleCents = 0;
    for (const it of input.items) eligibleCents += eligibleItemSubtotalCents(it, c);
    eligibleCents = Math.min(eligibleCents, runningSubtotalCents);
    if (eligibleCents <= 0) {
      messages.push(`coupon.no_eligible_items:${code}`);
      continue;
    }

    let discountCents = 0;
    if (c.type === 'PERCENT') {
      const pct = clamp((c.valuePct ?? c.valueCents) as number, 0, 100);
      discountCents = Math.floor((eligibleCents * pct) / 100);
    } else if (c.type === 'FIXED') {
      discountCents = Math.min(c.valueCents, eligibleCents);
    }

    discountCents = clamp(discountCents, 0, runningSubtotalCents);
    runningSubtotalCents -= discountCents;
    codesApplied.push({ code, type: c.type, amountCents: discountCents });
  }

  const subtotalBefore = dollars(subtotalCents);
  const subtotalAfter = dollars(runningSubtotalCents);
  const shippingDiscount = dollars(shippingDiscountCents);
  const discountTotal = dollars(
    codesApplied.reduce((s, a) => s + a.amountCents, 0) + shippingDiscountCents,
  );

  return {
    codesApplied: codesApplied.map((c) => ({
      code: c.code,
      type: c.type,
      amount: dollars(c.amountCents),
    })),
    lineItemAdjustments,
    shippingDiscount,
    subtotalBefore,
    subtotalAfter,
    discountTotal,
    messages,
    normalizedCodes: selectedCodes,
  };
}
