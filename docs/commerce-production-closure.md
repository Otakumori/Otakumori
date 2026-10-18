# Commerce Production Closure

Baseline: `1e9bac75113acb95e9dd485ef02e3eaf050b2062`

## Authority map

| Concern | Canonical authority | Operational boundary |
|---|---|---|
| Catalog | Prisma `Product` / `ProductVariant` | Active, visible, Printify-owned products and enabled, in-stock variants only |
| Cart | Client cart plus server cart synchronization | Checkout always revalidates current server product, variant, mapping, and price facts |
| Checkout | `POST /api/v1/checkout/session` | Authenticated, durable idempotency claim, local order precreation, Stripe Checkout |
| Payment | Stripe Checkout Session | Browser never supplies authoritative price, identity, or paid state |
| Webhook | `POST /api/webhooks/stripe` | Signature verification, durable event processing state, payment reconciliation, fulfillment handoff |
| Fulfillment | `createPrintifyOrder` | Local order claim precedes provider call; uncertain provider outcomes fail closed |
| Tracking | Verified Printify webhook | `order:shipment:created` updates local shipment and tracking facts |
| Customer orders | `GET /api/orders` | Current-user order, financial, refund, fulfillment, and tracking state |
| Refund reconciliation | Stripe `charge.refunded` webhook | Records refunded amount/time; a full refund closes the order as cancelled |
| Operations | Admin order list/detail plus confirmed fulfillment retry API | Provider IDs, sync errors, tracking, payment facts, and narrowly safe retries |

Compatibility endpoints do not own transactions: `/api/stripe/webhook` delegates to the canonical Stripe webhook; `/api/v1/orders`, `/api/v1/checkout/order`, and `/api/shop/orders` reject direct order/fulfillment creation.

## Canonical order state machine

| State | Meaning | Owner / transition |
|---|---|---|
| `pending` | Local checkout exists; payment is not yet confirmed | Checkout session endpoint |
| `pending_mapping` | Paid; fulfillment is awaiting or blocked on provider reconciliation | Stripe webhook / fulfillment adapter |
| `in_production` | Printify accepted the order or confirmed production | Fulfillment adapter / Printify webhook |
| `shipped` | Provider supplied shipment facts | Printify webhook or confirmed admin tracking update |
| `cancelled` | Order is cancelled or fully refunded | Reconciliation/admin authority |

Partial/full refund truth is additionally represented by `refundAmount` and `refundedAt`; the current enum has no separate refunded state. Provider failures are represented by `PrintifyOrderSync.status/error` while the paid order remains `pending_mapping`, preventing false fulfillment success.

## Provider launch matrix

| Provider | Catalog authority | Variant authority | Fulfillment | Tracking | Launch authorized |
|---|---|---|---|---|---|
| Printify | Local records mapped to a Printify product ID | Local enabled/in-stock variant mapped to numeric Printify variant ID | Canonical, claimed and replay-safe | Verified provider webhook | Yes, subject to configured credentials/webhook |
| Merchize | Read-only/import support exists | Seller/store variant authority is not proven in checkout | No canonical order path | Not proven | **No — fail closed** |
| Internal/other | No launch fulfillment owner | No launch variant owner | Rejected by canonical checkout | None | No |

## Failure and recovery matrix

| Failure | Detected where | Customer state | Admin state | Retry safe | Recovery |
|---|---|---|---|---|---|
| Unauthenticated checkout | Checkout endpoint | No order | None | Yes | Authenticate and retry |
| Missing/replayed idempotency key | Checkout endpoint / durable claim | No duplicate session | Existing order/session is replayed or request conflicts | Yes | Reuse completed response; investigate an incomplete claim |
| Invalid/stale product or variant | Server product/variant validation | Checkout rejected | No provider order | Yes | Refresh cart/catalog mapping |
| Stripe session creation failure | Checkout endpoint | No payment success | Pending local order and durable claim expose partial state | Manual | Reconcile before creating a new checkout |
| Duplicate Stripe webhook | Webhook event state | No duplicate state transition | Marked duplicate/processing | Yes | Stripe retry is idempotent |
| Payment succeeds, Printify mapping fails | Fulfillment adapter | Paid, fulfillment pending | `mapping_failed` with error | Explicit retry | Repair mapping, confirmed admin retry |
| Provider rejects request | Fulfillment adapter | Paid, fulfillment pending | `failed` with provider error | Explicit retry | Diagnose, then confirmed admin retry |
| Provider timeout/unknown acceptance | Fulfillment adapter | Paid, fulfillment pending | `submission_uncertain` | **No automatic retry** | Reconcile by local `external_id` / provider order before retry |
| Provider accepts, local persistence fails | Provider/local transaction boundary | Paid, fulfillment pending | Submission claim remains non-terminal | **No automatic retry** | Reconcile provider order by external ID, then repair local sync |
| Shipment created | Printify webhook | Tracking visible | Order becomes shipped | Idempotent event | No action |
| Refund | Stripe webhook | Refund amount/state visible | Financial overlay recorded | Idempotent event | Provider cancellation remains an operator decision |
| Success page revisit | Confirmation/order read | Existing order reused | No new transaction | Yes | Read-only confirmation |

## Tax status

The canonical checkout currently enables neither Stripe `automatic_tax` nor an application-side tax calculator. Tax is therefore not calculated. Launch requires an owner decision and account readiness for registrations, product tax-code policy, jurisdictions, and shipping tax treatment before enabling Stripe Tax. The checkout UI states this truthfully; this branch does not make tax or legal determinations.

## Financial data provenance

| Fact | Source / capture |
|---|---|
| Subtotal | Stripe Checkout `amount_subtotal`, reconciled to `subtotalCents` |
| Discount | Server coupon calculation and Stripe `total_details.amount_discount` |
| Shipping | Stripe `total_details.amount_shipping` |
| Tax | Stripe `total_details.amount_tax`; currently zero because tax is not enabled |
| Paid amount | Stripe `amount_total` |
| Currency | Stripe Checkout currency |
| Refund | Stripe `charge.refunded` amount/time |
| Payment IDs | Checkout Session, PaymentIntent, and Charge IDs |
| Provider IDs | Printify order ID in `Order.printifyId` and `PrintifyOrderSync` |
| Provider COGS | Current `ProductVariant.costCents`; not snapshotted on `OrderItem` |

## Deferred blockers

- Configure and certify Stripe Tax before Production launch; no tax is currently calculated.
- Perform a test-mode real-money certification with test Stripe and a non-production Printify fixture/shop before Production activation.
- Add immutable per-order provider COGS capture in the Finance + Tax Operations phase; current catalog cost can change after purchase.
- Define provider cancellation policy and confirmed refund/cancellation operations. This closure reconciles externally issued refunds but does not expose a live money-moving admin action.
- Retire dead implementation bodies in compatibility modules after imports/callers are independently proven absent; their exported transaction surfaces are already fail-closed or delegated.
