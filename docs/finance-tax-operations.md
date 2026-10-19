# Finance + Tax Operations

Baseline: Commerce Production Closure v1 (`47603b081a33f558d00dccce957f80a8c4a4c36f`).

## Authority map

| Fact                                              | Canonical authority                              | Finance representation                                                                    |
| ------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Checkout total, subtotal, discount, shipping, tax | Stripe Checkout reconciled into `Order`          | `Order` remains the current-state source; paid events emit ledger facts                   |
| Sale                                              | Paid Stripe Checkout session                     | `FinancialTransaction.category=product_sale`, deterministic order source ID               |
| Refund                                            | Stripe `charge.refunded` cumulative amount       | `Order.refundAmount` plus one idempotent cumulative ledger row per charge                 |
| Payment fee                                       | Expanded Stripe Balance Transaction              | `payment_processing`; absent means unknown, never estimated                               |
| Provider COGS                                     | `ProductVariant.costCents` at paid-event capture | Immutable `provider_cogs` metadata snapshot; missing costs become `provider_cogs_unknown` |
| Shipping income                                   | Stripe Checkout total details                    | `shipping_income` ledger fact                                                             |
| Shipping expense                                  | No canonical persisted source                    | Unknown / unreconciled; not inferred from shipping collected                              |
| Tax collected                                     | Stripe Checkout total details                    | `tax_collected`; currently zero because tax calculation is disabled                       |
| Fulfillment                                       | `Order` + `PrintifyOrderSync`                    | Reconciliation context only; Printify remains launch provider                             |

Ledger IDs encode source identity. Paid-order rows use `finance:order:<orderId>:<fact>`; Stripe fee and refund rows use Stripe source identifiers. Replay therefore cannot duplicate a financial fact. The ledger uses signed cents and explicit currency. Every row retains source authority in metadata.

## Reconciliation rules

For a paid order, merchandise net plus shipping collected plus tax collected must equal the local total last reconciled from Stripe. The cumulative refund ledger must equal `Order.refundAmount`. A paid order must have a PaymentIntent and an immutable COGS snapshot. Provider errors or `pending_mapping` remain operator-review conditions.

Historical orders without ledger/COGS snapshots are deliberately `UNKNOWN / UNRECONCILED`. Current catalog cost is never applied retroactively. Shipping expense and Stripe fees remain unknown when their authoritative provider facts were not captured.

The Admin Finance & Tax Center exposes summary → reconciliation row → order operations, with a source digest for the selected period. A period is not eligible for close review while unresolved orders exist or tax readiness is blocked. The digest identifies the exact order/ledger version set used for the summary; this branch does not create a mutable “force close” action.

## Tax readiness

Current status: **BLOCKED**.

- Stripe Checkout `automatic_tax` is off.
- No manual tax calculator exists.
- No confirmed tax registrations are in the factual tax registry.
- Product tax-code and shipping tax-treatment policies are not configured.
- No nexus conclusion is inferred.

The registry in `lib/finance/tax-registry.ts` represents owner-confirmed operational facts only: jurisdiction, registration state/effective date/identifier, filing frequency, provider, and notes. Stripe Tax may be enabled only in a separate owner-approved phase after registrations, tax-code policy, shipping treatment, Checkout integration, webhook capture, and test-mode proof are complete. This work performs no registration, filing, or payment.

## Tax-year close

1. Select a year/period.
2. Review Stripe/local/refund/fulfillment/COGS mismatches.
3. Resolve or explicitly carry every unknown through operator reconciliation.
4. Confirm tax readiness separately; do not conceal blocked registration/configuration.
5. Export the source datasets and preserve their period plus source digest.
6. Owner/accountant approves any external close, filing, or bookkeeping entry.

## Exports

Admin-authenticated CSV datasets are provided for:

- P&L summary
- General Ledger
- Orders
- Refunds
- Stripe reconciliation
- Provider COGS
- Sales by jurisdiction/state
- Sales-tax liability
- Unresolved reconciliation

Every export carries dataset name, UTC period, generation time, source digest, and provenance. CSV is directly XLSX-importable. PDF presentation is deferred because it does not improve source integrity.

## Deferred production/legal actions

- Stripe Tax enablement and test-mode certification
- registration/nexus/legal determinations
- filing and tax payment
- populated-data owner/accountant reconciliation proof
- historical backfill from external Stripe/Printify evidence
- shipping-expense capture once an authoritative Printify cost source is established
- full fee backfill from Stripe Balance Transactions
- immutable signed close attestations, if required after operational proof

No Production charge, refund, provider order, database migration, filing, or data repair was performed by this phase.
