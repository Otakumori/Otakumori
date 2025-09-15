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

- POST `/api/stripe/webhook` → idempotent handling for currency purchases/orders; correlates to entitlements.
