# APIs — Contracts & Errors

All JSON errors conform to Problem+JSON:

```json
{ "type": "about:blank", "title": "Bad Request", "status": 400, "detail": "..." }
```

## Mini‑Games

- POST `/api/mini-games/session` → `{ runId, startedAt }`
- POST `/api/mini-games/submit` → `{ ok, awarded?, balance? }`

Both use Zod validation and Clerk auth, rate‑limited, and log with correlationId.

## Petals

- POST `/api/petals/collect` → `{ ok, balance }`, body = `{ source, amount }`
- GET `/api/petals/wallet` → `{ balance, updatedAt }`

## Petal Shop

- GET `/api/petal-shop/catalog` → active digital SKUs
- POST `/api/petal-shop/purchase` → atomic debit + entitlement grant

## Stripe Webhooks

- POST `/api/webhooks/stripe` → idempotent handling for currency purchases/orders; correlates to entitlements.

## Commerce Release Validation

Run the release readiness checks from the repo root:

- `pnpm env:audit:runtime --target preview` verifies local/preview runtime key modes without exposing secret values.
- `pnpm smoke` checks public API health and route reachability against `BASE_URL`, `PREVIEW_URL`, or local dev.
- `pnpm test:commerce-release` runs Stripe staging safety, static commerce checks, smoke, and the commerce Playwright suite.
- `pnpm validate:services` probes configured external services. It is a readiness report, not a merge blocker by itself when optional services are intentionally absent or stale.

Current interpretation rules:

- Stripe Preview/local validation must use `sk_test_*` and `pk_test_*`. Live Stripe keys in non-production are a hard failure unless an explicit temporary override window is documented.
- Clerk test mode is valid when `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are both test-mode keys.
- Clerk `302`/`307` handshakes on HTML routes can be valid in Preview when Clerk needs to establish browser state. API routes such as `/api/v1/cart` and `/api/health` should still return `200`.
- Database, Printify, Redis/Upstash, and Resend failures are independent service-readiness checks. Classify them by their exact status/error before treating them as commerce route or Stripe regressions.
- Live product sync is admin-triggered through `/api/v1/printify/sync` or background Inngest events and persists provider products into Prisma `Product`, `ProductVariant`, and `ProductImage` records.

Common service failure interpretations:

- Database `ENOTFOUND` or tenant/user lookup failures usually indicate the wrong `DATABASE_URL` target or stale pooled/direct connection details, not a Prisma schema migration by itself.
- Printify readiness should verify `GET /v1/shops.json` and `GET /v1/shops/{PRINTIFY_SHOP_ID}/products.json`. Some accounts return `404` for `/v1/shops/{PRINTIFY_SHOP_ID}.json`; that endpoint is not the product-sync source of truth.
- Redis/Upstash `fetch failed` or ping failure requires checking `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Some app paths degrade to memory/DB fallbacks, but rate limiting, cache, idempotency, and analytics features may require Redis.
- Resend readiness is split into two checks. Runtime send config requires `RESEND_API_KEY` with Resend Sending access plus `EMAIL_FROM`; this check does not send email. Admin/domain readiness uses `RESEND_ADMIN_KEY` with Resend Full access for `GET /domains`, with `RESEND_ADMIN_API_KEY` accepted as a legacy fallback; it skips when the admin key is absent and never falls back to `RESEND_API_KEY`.

## Merchize

Merchize integration remains staged separately from the current release stabilization patch. Existing code has Merchize env entries and catalog sync surfaces, but full API validation should wait for seller-dashboard credentials.

Required credential candidates:

- `MERCHIZE_API_URL` or `MERCHIZE_STORE_API_URL`
- `MERCHIZE_ACCESS_TOKEN` or `MERCHIZE_API_TOKEN`
- `MERCHIZE_WEBHOOK_SECRET` when webhook handling is enabled

Credentials should come from Merchize Seller Dashboard > Integrations > API and must stay server-only. The public Merchize storefront URL may be used as customer-facing product metadata, but it must not be used as the API base URL.
