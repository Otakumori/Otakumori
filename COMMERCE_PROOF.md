# Commerce Proof

## Summary

- Branch: `chore/commerce-schema-readiness-clean`
- Commit: `6f5c713d`
- Preview URL: `https://otaku-mori-dtbt2b7r1-otaku-mori-babe.vercel.app`
- Result: Gates 1.5, 2, 3A, 3B, 3C, 3D, and 3E passed.
- Production touched: no
- Provider writes: none expected and none observed
- Email sends: none expected and none observed
- Secrets exposed: no
- Destructive DB/provider actions: none

## Runtime And Migration Evidence

- Preview health: HTTP 200, healthy, database check passed.
- Runtime status: HTTP 200, `environment=preview`, `stripeMode=test`, fulfillment dry-run enabled, `fulfillmentProvider=printify`, `commerceProofSafe=true`.
- Preview migration baseline: 17 historical migrations resolved as applied.
- Gate 2 migration: `20260601143000_fulfillment_accounting_orchestration` applied by `pnpm prisma:deploy`.
- `_prisma_migrations`: exists.
- Gate 2 tables confirmed: `FulfillmentAttempt`, `TaxLedgerEntry`, `BusinessExpense`.
- Existing key tables confirmed: `User`, `Order`, `OrderItem`, `Product`, `ProductVariant`, `CheckoutSession`, `WebhookEvent`, `RewardLedger`, `PrintifyOrderSync`, `PrintifySyncLog`.

## Checkout And Webhook Evidence

- Checkout proof: exactly one Chromium proof run created one app checkout session after proof start.
- Stripe Checkout session: confirmed `cs_test_*`; full URL and full session ID omitted.
- Local order/session IDs: masked only.
- Signed webhook replay: one locally signed TEST `checkout.session.completed` replay to `/api/webhooks/stripe` returned HTTP 200.
- Signing fix used during proof: local fallback signer trimmed the pulled webhook secret before signing, matching deployed verification behavior.
- Webhook fulfillment response: `dry_run`, provider `printify`.
- Duplicate replay: exact same signed event replay returned duplicate/idempotent response with reason `already_processed`.

## Ledger And Fulfillment Evidence

- Proof order status after webhook: `pending_fulfillment`.
- Fulfillment attempts for proof order: exactly 1.
- Fulfillment attempt status: `dry_run`.
- Fulfillment provider: `printify`.
- `writesProvider:false`: confirmed.
- Provider external order ID: absent.
- Email marker count: 0.
- Ledger types confirmed with one row each: `SALE_GROSS`, `DISCOUNT`, `SHIPPING_CHARGED`, `TAX_COLLECTED`, `STRIPE_FEE`, `REFUND`, `PROVIDER_PRODUCTION_COST`, `PROVIDER_SHIPPING_COST`, `NET_REVENUE_ESTIMATE`.
- Duplicate replay left fulfillment attempt count, gross-sale ledger count, provider external order state, and email marker count unchanged.

## Commands Run

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `vercel env pull <temp> --environment=preview --git-branch chore/commerce-schema-readiness-clean --yes`
- `pnpm prisma migrate resolve --applied <historical migration>`
- `pnpm prisma:deploy`
- `pnpm prisma migrate status`
- Metadata-only DB checks against `information_schema` and Prisma models
- `vercel redeploy <preview-url> --target preview --no-wait`
- `pnpm playwright test --config=playwright.commerce-release.config.ts --project=chromium --grep=Stripe`
- Signed TEST webhook replay to `/api/webhooks/stripe`

## Blockers And Fixes

- Initial Gate 2 env pull exposed empty Stripe values. Fixed by setting branch Preview TEST Stripe values and rerunning sanitized env proof.
- Initial `pnpm prisma:deploy` failed with `P3005` because Preview had an existing schema without Prisma migration history. Fixed by approved baseline of historical migrations only, then applying the target migration through `pnpm prisma:deploy`.
- Initial Gate 3C signed fallback replay returned HTTP 400 invalid signature. Diagnosed local signing as valid and redeployed Preview; final fix was trimming the pulled webhook secret in the local fallback signer before signing.

## Rollback Path

- Set `FULFILLMENT_PROVIDER=manual`.
- Set `FULFILLMENT_DRY_RUN=true`.

## Cleanup Plan

- Unify admin authorization across admin routes and internal proof/health surfaces.
- Move admin email configuration into env/config with one shared helper.
- Reconcile `FinancialTransaction` with `TaxLedgerEntry` so financial reporting has one source of truth.
- Build ledger-derived exports for sales, taxes, fees, refunds, provider costs, and business expenses.
- Replace placeholder Stripe fee/provider cost/refund/business expense entries with real writes when provider and Stripe objects are authoritative.
- Expand `OrderStatus` for clearer payment, fulfillment, refund, and manual-review states.
- Consolidate email sending/logging so order confirmation and admin notifications share one audited path.
- Ensure Stripe Dashboard webhook targets only canonical `/api/webhooks/stripe`.
- Optionally split Resend admin API/domain operations from transactional send credentials.
- Quarantine legacy checkout/webhook/admin routes behind explicit compatibility rules.
- Add branded platform error pages for checkout, webhook, auth, and provider failure modes.
- Add a future runtime intelligence layer for sanitized commerce readiness, provider mode, webhook target, and ledger health.
