# Commerce Spine Release Checklist

This checklist is for a same-day Commerce Spine + Realm Foundation release. Do not include secrets in this document or in build logs.

## Pre-deploy local gates

- `pnpm type-check`
- `pnpm lint`
- `pnpm build`
- With a local server already running, `pnpm smoke`

## Vercel environment verification

- Confirm Preview and Production have the same build command path: `pnpm build`.
- Confirm install command keeps dev dependencies available for type/lint/build gates.
- Confirm Node version is compatible with the repo engine: `>=20.12 <21`.
- Confirm optional providers are configured per environment without making unrelated providers fatal.

## Required commerce env vars

- `DATABASE_URL`
- `DIRECT_URL` if the deployment uses direct Prisma connections or migrations
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`

## Provider env vars

- Printify: `PRINTIFY_API_KEY`, `PRINTIFY_SHOP_ID`, `PRINTIFY_WEBHOOK_SECRET` if webhook validation is enabled.
- Merchize: `MERCHIZE_API_URL` or `MERCHIZE_STORE_API_URL`, `MERCHIZE_ACCESS_TOKEN` or `MERCHIZE_API_TOKEN`, `MERCHIZE_WEBHOOK_SECRET`.
- Blob/media: `BLOB_READ_WRITE_TOKEN` if Blob-backed uploads or media management are enabled.
- Redis: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` if rate limiting, cache, or queue features require Redis.

## Preview deploy smoke

- Open `/` signed out.
- Open `/shop` signed out.
- Open `/blog` signed out.
- Request `/api/v1/cart` signed out and confirm HTTP 200 with an empty guest cart.
- Request `/api/health` and confirm provider-specific missing config appears as warnings, not global failure.
- Open `/shop/cart` signed out.
- Open `/shop/checkout` signed out and confirm the empty-cart or sign-in path is intentional.
- If Vercel Deployment Protection is enabled, run smoke with an automation bypass secret:
  `VERCEL_AUTOMATION_BYPASS_SECRET=<secret> BASE_URL=<preview-url> pnpm smoke`.
  The smoke script sends the secret only as the `x-vercel-protection-bypass` header and does not print it.

## 2026-05-21 PR #29 verification snapshot

- Branch: `chore/commerce-schema-readiness-clean`
- Local HEAD verified after validation: `894ea392f37cbba0c2f31282981cb4f876369496`
- Origin branch HEAD verified: `894ea392f37cbba0c2f31282981cb4f876369496`
- Current Ready Preview URL: `https://otaku-mori-bow6t4lhb-otaku-mori-babe.vercel.app`
- Vercel build status: Ready.
- Local gates: `pnpm type-check` passed, `pnpm lint` passed with 0 errors and 198 warnings under the configured threshold, `pnpm prisma generate` passed, and `pnpm build` passed.
- Smoke status: Manual Required - Preview smoke skipped because no Vercel protection bypass env var is loaded in this shell.
- Checkout safety update: customer-facing checkout session 500 responses are generic and keep `requestId` plus `stage`; detailed exception text stays server-side.
- Merchize catalog safety update: explicit cent/minor-unit fields are treated as cents, decimal currency fields are converted to cents, and ambiguous large integer prices are left unsellable instead of risking a 100x charge.
- Remaining manual gates: Stripe test checkout, Stripe webhook replay/idempotency, Printify catalog sync, Merchize catalog sync if env exists, Clerk Preview sign-in/callback, Mobile Safari checkout path, and proof that fulfillment only starts after verified Stripe webhook payment truth.

## 2026-05-19 preview verification snapshot

- Branch: `chore/commerce-schema-readiness-clean`
- Latest smoke-passing deploy SHA: `58cf70d8`
- Health fix commit: `3f7603a3`
- Latest smoke-passing Preview URL: `https://otaku-mori-m7uxkaf6y-otaku-mori-babe.vercel.app`
- Current fulfillment-gate deploy SHA: `fd51200f`
- Current fulfillment-gate Preview URL: `https://otaku-mori-5totxs23h-otaku-mori-babe.vercel.app`
- Current fulfillment-gate Preview status: Ready and superseded by the `58cf70d8` smoke-green deployment.
- Current provider-hardening deploy SHA: `6df9eaf0`
- Current provider-hardening Preview URL: `https://otaku-mori-hcn2u9bfy-otaku-mori-babe.vercel.app`
- Current provider-hardening Preview status: Ready; bypass-backed smoke rerun is required before this deployment replaces the smoke-passing baseline.
- Stable branch Preview alias: `https://otaku-mori-git-chore-commerce-schema-rea-8c786b-otaku-mori-babe.vercel.app`
- Vercel build status: Ready.
- Local gates: `pnpm type-check`, `pnpm lint`, `pnpm prisma generate`, and `pnpm build` passed.
- Smoke status: Deployment Protection bypass reaches the app and route smoke is green.
- Verified smoke route results: `/` 200, `/shop` 200, `/blog` 200, `/api/v1/cart` 200, `/api/health` 200, `/shop/cart` 200, `/shop/checkout` 200.
- Exact smoke command: `VERCEL_AUTOMATION_BYPASS_SECRET=<secret> BASE_URL=https://otaku-mori-m7uxkaf6y-otaku-mori-babe.vercel.app pnpm smoke`.
- Protection bypass status: configured and working. Keep using `VERCEL_AUTOMATION_BYPASS_SECRET` or `VERCEL_PROTECTION_BYPASS` for preview smoke; do not commit the value.
- Env status: Vercel build completed with `pnpm build`; no env-schema build blocker was observed in the inspected deployment.
- Health status: root cause was a brittle `/api/health` implementation that only wrapped a database `SELECT 1` and returned a raw 500 on any exception. The route now returns sanitized structured dependency checks, treats optional provider config as skipped, and supports strict non-200 monitoring through `/api/health?strict=1`.
- Post-fix smoke status: passed from a shell with the protection bypass secret loaded.
- Stripe webhook status: code readiness verified by local gates only; live webhook delivery and replay idempotency still require Dashboard testing.
- Stripe checkout static audit: `/api/v1/checkout/session` validates product, variant, stock/enabled state, quantity, price, and currency from Prisma before creating Stripe line items. Checkout metadata includes `local_order_id`, Clerk/local user IDs, idempotency key, request ID, and `source=otakumori_checkout`.
- Provider catalog model: Printify and Merchize sync into local `Product` and `ProductVariant` records first. Stripe is not catalog truth for launch; Checkout builds dynamic Stripe `price_data` from local DB values and includes local/provider product and variant IDs in Stripe product metadata for reconciliation.
- Schema fit: Printify has first-class `printifyProductId`, `printifyVariantId`, `blueprintId`, and `printProviderId` fields. Merchize is represented for launch through `Product.integrationRef=merchize:<id>`, `Product.specs`, variant `sku`, synthetic local `printifyVariantId` compatibility IDs, and structured `optionValues` preserving Merchize product/variant IDs. Generic `provider`, `providerProductId`, and `providerVariantId` columns remain a Phase 2 migration candidate.
- Catalog sync operations: admin-only `/api/admin/catalog-sync` supports provider diagnostics and protected manual sync for `printify`, `merchize`, or `all`. Legacy `/api/admin/printify-sync` now delegates to the shared Printify catalog sync path; `/api/v1/printify/sync` is admin-protected.
- Stripe catalog Phase 2: existing `stripeProductId` and `stripePriceId` fields should be treated as an optimization path only. Create/reuse Stripe Products and create new immutable Stripe Prices during provider sync after local catalog sync is proven reliable; do not create duplicate Stripe Products/Prices on every launch sync.
- Payment truth status: `/shop/checkout/success` is display/cart cleanup only; order payment state is reconciled by the canonical `/api/webhooks/stripe` handler after Stripe signature verification.
- Fulfillment gate status: public direct Printify fulfillment endpoints are disabled for client-triggered POSTs; fulfillment must start from verified Stripe webhook processing or an admin-controlled recovery path.
- Printify/Merchize status: provider routes are expected to degrade to sanitized diagnostics when env is absent; live order sync still requires provider credentials and test orders. Printify fulfillment now skips already-synced local orders and records provider request failures as `fulfillment_failed` with a `PrintifyOrderSync` failure row.
- Stripe test checkout result: pending manual Preview validation from an authenticated session with Stripe test-mode dashboard access. The current shell did not have Preview bypass, Clerk, or Stripe secrets loaded, so no live payment or replay was performed from this run.
- Webhook delivery/replay result: pending manual Stripe Dashboard validation. Static audit confirms canonical signature verification and `WebhookEvent` event-ID dedupe; live event delivery and replay still need to be proven against Preview.
- Order record audit result: pending after the first completed test payment.
- Observability status: Sentry/OpenTelemetry build warnings remain non-blocking; capture behavior still needs Preview runtime validation after protection bypass.
- Credential rotation note: `.env.template` has been sanitized and currently contains placeholders only. Rotate the Vercel Deployment Protection automation bypass secret after shared use, rotate any database credentials that ever appeared in git history or real-looking templates, and confirm Vercel Preview/Production env vars use current rotated values before cutover.

## Manual Stripe test

- Create a checkout from a real catalog item and variant.
- Confirm Stripe Checkout Session metadata includes the local order/session key.
- Complete test payment.
- Confirm the canonical Stripe webhook endpoint receives `checkout.session.completed`.
- Confirm local order moves from `pending_payment` to `pending_fulfillment` or provider failure/manual review.
- Replay the webhook event and confirm fulfillment is not duplicated.
- Order record audit required after payment: verify status, `paidAt`, Stripe Checkout Session/payment intent reference, local user reference, line items, `PrintifyOrderSync` or skipped provider state, timestamps, and sanitized failure/error state.

## Manual provider tests

- Printify: sync one product, confirm provider product and variant IDs, submit one paid test order, and confirm failed sync is visible in admin or health.
- Merchize: test admin-only connection, submit one paid test order when configured, and confirm failed sync is visible in admin or health.

## Clerk and account checks

- Sign in on Preview.
- Sign out and browse public pages.
- Open account routes signed out and confirm clean redirect.
- Verify Preview and Production domains/callbacks in Clerk dashboard.

## Mobile and browser checks

- Mobile Safari: homepage, shop, product detail, cart, checkout.
- Confirm hero scene does not flash incorrect markup before hydration.
- Confirm reduced motion settings do not force heavy animation.

## Admin operations

- Open admin health signed in as an admin.
- Confirm debug and diagnostic routes are admin-only.
- Confirm order view shows payment state and fulfillment state.
- Confirm provider failures route to manual review or fulfillment failure.

## Promote and rollback

- Promote only after Preview gates, Stripe test, provider test, Clerk test, and mobile smoke pass.
- Keep the previous Vercel deployment available for rollback.
- If checkout or webhook verification fails after promote, roll back first and investigate with Stripe event IDs and local order IDs.

## Known non-blocking warnings

- Local Node may differ from the repo engine; use Node 20.x in deployment.
- Browser data update warnings do not block launch but should be refreshed in routine dependency maintenance.
- Sentry/OpenTelemetry bundling warnings are acceptable if capture still fails open and build passes.
