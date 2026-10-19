# Admin Operations Closure

Baseline: Finance + Tax Operations v1 (`d6c4863bb133ca11b71bb48cb003472a80611db5`).

## Authority

- `/admin` is the attention queue. It reuses the current-year canonical finance report and links every exception to its order or finance drill-down.
- `/admin/orders` is the order operations surface. It exposes local order state, customer/items, Stripe identifiers, Printify state, tracking, immutable ledger facts, COGS, and reconciliation issues.
- `/admin/finance` remains the source-backed reconciliation, tax-readiness, close-gate, provenance, and export authority.
- `/api/admin/orders/[id]/fulfillment` is the only Admin fulfillment retry. It requires admin authority, an explicit confirmation phrase, a paid order, and a retry-safe provider state.
- `submission_uncertain` is never retryable automatically. An operator must first reconcile the provider state outside the application.
- Tracking updates remain admin-only and mark an order shipped only when a real tracking number is recorded.

## Attention states

| State                    | Source                                    | Drill-down            |
| ------------------------ | ----------------------------------------- | --------------------- |
| Pending checkout/payment | unpaid local `pending` order              | Orders                |
| Pending fulfillment      | paid, unshipped order plus Printify state | Orders                |
| Fulfillment error        | retry-safe Printify failure state         | Orders                |
| Submission uncertain     | Printify uncertainty boundary             | Orders; retry blocked |
| Shipped                  | local order state                         | Orders                |
| Cancelled/refunded       | local cancellation or Stripe refund fact  | Orders                |
| Financially unreconciled | canonical finance reconciliation          | Finance               |
| Unknown COGS             | immutable ledger fact missing/unknown     | Finance               |
| Finance close blocker    | canonical close gate                      | Finance               |
| Tax readiness            | factual tax registry/readiness            | Finance               |

## Recovery policy

- Refreshing Admin views is read-only.
- Retry is available only for `failed`, `mapping_failed`, and `no_items`; the server repeats all safety checks.
- `submitting`, `submission_uncertain`, accepted, in-production, and shipped provider states fail closed for retry.
- Tracking mutation requires canonical Admin authority. No refund, charge, tax, or provider-purchase action was added.

## Populated operational proof

Deterministic fixtures cover paid/reconciled with known COGS, unpaid checkout, paid/pending fulfillment, retry-safe failure, uncertain submission, shipped/tracking-ready state, refund/cancellation, historical unknown COGS, and finance mismatch. The attention model preserves unknowns and routes each state to source records rather than synthesizing totals.

## Deferred owner/provider actions

- Reconcile an uncertain Printify submission using provider records before any retry.
- Stripe Tax remains blocked pending owner account, registration, jurisdiction, product-tax-code, and shipping-treatment decisions.
- Live refunds, charges, provider orders, tax registrations, filings, and payments remain outside Admin and require explicit owner action.
