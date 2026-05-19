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

## 2026-05-19 preview verification snapshot

- Branch: `chore/commerce-schema-readiness-clean`
- Health fix commit: `3f7603a3`
- Latest inspected Preview URL: `https://otaku-mori-okoyn93da-otaku-mori-babe.vercel.app`
- Stable branch Preview alias: `https://otaku-mori-git-chore-commerce-schema-rea-8c786b-otaku-mori-babe.vercel.app`
- Vercel build status: Ready.
- Local gates: `pnpm type-check`, `pnpm lint`, `pnpm prisma generate`, and `pnpm build` passed.
- Smoke status: Deployment Protection bypass reaches the app. Verified route results from bypass smoke: `/`, `/shop`, `/blog`, `/api/v1/cart`, `/shop/cart`, and `/shop/checkout` returned 200; `/api/health` returned an app-level 500 before the health route hardening patch.
- Exact smoke command after bypass is available: `VERCEL_AUTOMATION_BYPASS_SECRET=<secret> BASE_URL=https://otaku-mori-okoyn93da-otaku-mori-babe.vercel.app pnpm smoke`.
- Protection bypass status: configured and working. Keep using `VERCEL_AUTOMATION_BYPASS_SECRET` or `VERCEL_PROTECTION_BYPASS` for preview smoke; do not commit the value.
- Env status: Vercel build completed with `pnpm build`; no env-schema build blocker was observed in the inspected deployment.
- Health status: root cause was a brittle `/api/health` implementation that only wrapped a database `SELECT 1` and returned a raw 500 on any exception. The route now returns sanitized structured dependency checks, treats optional provider config as skipped, and supports strict non-200 monitoring through `/api/health?strict=1`.
- Post-fix smoke status: pending rerun from a shell with the protection bypass secret loaded.
- Stripe webhook status: code readiness verified by local gates only; live webhook delivery and replay idempotency still require Dashboard testing.
- Printify/Merchize status: provider routes are expected to degrade to sanitized diagnostics when env is absent; live order sync still requires provider credentials and test orders.
- Observability status: Sentry/OpenTelemetry build warnings remain non-blocking; capture behavior still needs Preview runtime validation after protection bypass.
- Credential rotation note: `.env.template` has been sanitized; if any previously committed template values were real, rotate those credentials before launch.

## Manual Stripe test

- Create a checkout from a real catalog item and variant.
- Confirm Stripe Checkout Session metadata includes the local order/session key.
- Complete test payment.
- Confirm the canonical Stripe webhook endpoint receives `checkout.session.completed`.
- Confirm local order moves from `pending_payment` to `pending_fulfillment` or provider failure/manual review.
- Replay the webhook event and confirm fulfillment is not duplicated.

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
