Coupons — Implementation Notes

Overview

- Coupons apply at checkout and are persisted on the Order as `appliedCouponCodes` and `discountTotalCents`.
- Printify is unaware of discounts. Margin calculations should subtract discounts when evaluating profitability.

Schema

- Coupon: `code`, `type` (PERCENT|FIXED|FREESHIP), `valueCents` (percent uses 0–100), enable window and caps, scoping (products/collections), flags (stackable, one-time), notes.
- CouponRedemption: tracks lifecycle across checkout. Idempotent on (couponId, clientReferenceId).
- Order: `appliedCouponCodes String[]`, `discountTotalCents Int`.

Engine

- `lib/coupons/engine.ts` is pure: validates eligibility, computes breakdown with half-up rounding to cents and a shipping discount for FREESHIP.
- Single-code by default; multiple only if all selected are `stackable`.
- Scoping: discounts only against eligible line items.

APIs

- POST `/api/coupons/preview`: returns CouponBreakdown for given cart and codes. Caches coupon metadata in Redis for ~60s.
- POST `/api/coupons/attach`: upserts PENDING CouponRedemption for (code, clientReferenceId) and optional user.

Checkout

- `/api/v1/checkout/session` accepts `couponCodes` and recomputes engine server‑side. Line item prices are adjusted (preferred) and metadata includes `coupon_codes` and `discount_total_cents`.
- FREESHIP sets a zero shipping option for the session when present.

Webhooks

- `/api/webhooks/stripe` on `checkout.session.completed` updates Order with `appliedCouponCodes`/`discountTotalCents` and marks matching CouponRedemptions as `SUCCEEDED` (attaches `orderId`, `userId`).
- On failure/expiry paths you can mark related redemptions `CANCELED`.

Tax & Rounding

- Unit prices passed to Stripe are post-discount to ensure Stripe Tax sees the discounted base.
- Penny drift is corrected by adjusting the first line item by the minimal necessary cents to match the target discounted subtotal.

Security

- Codes are case-insensitive, trimmed. Rate-limited preview/attach.
- Optionally sign preview results with `COUPON_SIGNING_SECRET` if client needs to echo breakdown; server always recomputes before creating sessions.

Seed Ideas

- SAVE10: 10% off (minSubtotal $30, not stackable)
- TAKE5: $5 off (stackable)
- SHIPFREE: Free shipping
- DROP20: 20% off, scoped to a collection
