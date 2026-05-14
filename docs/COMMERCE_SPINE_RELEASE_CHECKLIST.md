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
