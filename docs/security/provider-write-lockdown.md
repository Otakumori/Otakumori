# Provider Write Lockdown

Security containment for unauthenticated / weakly-authenticated routes that
perform provider-side writes (Printify, EasyPost, Clerk Admin API), trigger
background jobs, expose configuration/diagnostics, or grant in-app currency.

Auth is enforced **route-locally** in each handler. `middleware.ts` returns
early for all `/api/*` requests (CORS/headers only) and does **not** gate API
auth, so every protected handler calls its guard itself.

## Shared guard

`app/lib/security/providerWriteGuard.ts` exports `authorizeProviderWrite(req, opts?)`:

```ts
const guard = await authorizeProviderWrite(req);
if (!guard.ok) return guard.response; // fail-closed NextResponse
```

- Returns `{ ok: true, principal } | { ok: false, response }`, mirroring
  `authorizeAdminApi` in `app/lib/auth/admin.ts`.
- Default policy: `clerk_admin_or_internal_service` — Clerk admin **or** a valid
  `INTERNAL_AUTH_TOKEN` / `API_KEY` compared with `crypto.timingSafeEqual`.
- `requireEnvFlag` (staging-only) and `developmentOnly` modes **fail closed**:
  the request is rejected before any provider call if the condition is not met.
- No raw request body or secret material is logged from the guard.

## Protected routes

### Provider-write / mutation (route-local auth)

| Route | Methods | Guard |
|-------|---------|-------|
| `app/api/clerk-proxy/[...path]/route.ts` | GET, POST | `authorizeProviderWrite` |
| `app/api/shop/orders/route.ts` | POST | `authorizeProviderWrite` |
| `app/api/shipping/buy/route.ts` | POST | `authorizeProviderWrite` |
| `app/api/shipping/rates/route.ts` | POST | `authorizeProviderWrite` |
| `app/api/v1/sync-external/route.ts` | POST | `authorizeAdminApi('clerk_admin_or_internal_service')` |
| `app/api/v1/printify/inventory/sync/route.ts` | GET, POST | `authorizeAdminApi('clerk_admin_or_internal_service')` |
| `app/api/metrics/route.ts` | POST | `authorizeAdminApi('clerk_admin_or_internal_service')` |

### Test/debug triggers (development-only unless admin/internal)

| Route | Methods | Guard |
|-------|---------|-------|
| `app/api/test-inngest/route.ts` | GET, POST | `authorizeProviderWrite({ developmentOnly: true })` |
| `app/api/_debug/posthog/route.ts` | POST | `authorizeProviderWrite({ developmentOnly: true })` |
| `app/api/v1/test-sentry/route.ts` | GET, POST | `authorizeProviderWrite({ developmentOnly: true })` |
| `app/api/webhooks/printify/test/route.ts` | POST | `authorizeProviderWrite({ developmentOnly: true })` |

### Diagnostics (admin/internal only)

| Route | Methods | Guard |
|-------|---------|-------|
| `app/api/_health/route.ts` | GET | `authorizeAdminApi('clerk_admin_or_internal_service')` |
| `app/api/health/comprehensive/route.ts` | GET | `authorizeAdminApi('clerk_admin_or_internal_service')` |
| `app/api/health/inngest/route.ts` | GET | `authorizeAdminApi('clerk_admin_or_internal_service')` |
| `app/api/v1/printify/health/route.ts` | GET | `authorizeAdminApi('clerk_admin_or_internal_service')` |
| `app/api/printify/products/route.ts` | GET | `authorizeAdminApi('clerk_admin_or_internal_service')` |
| `app/api/v1/shop/products/route.ts` | GET | `authorizeAdminApi('clerk_admin_or_internal_service')` |
| `app/api/merchize/products/route.ts` | GET | `authorizeAdminApi('clerk_admin_or_internal_service')` |
| `app/api/v1/avatar/export/health/route.ts` | GET | `authorizeAdminApi('clerk_admin_or_internal_service')` |
| `app/api/test-simple/route.ts` | GET | `authorizeAdminApi('clerk_admin_or_internal_service')` |

### Public liveness (kept minimal)

| Route | Methods | Behavior |
|-------|---------|----------|
| `app/api/health/route.ts` | GET | Returns only `{ ok, status }`. `ok` still reflects DB connectivity + required-config presence, but the env-presence/provider map is removed. `?strict=1` returns 503 when not ok. |
| `app/api/route.ts` | GET | Returns `{ ok, status }` only (no env, version, or feature map). |

Already-guarded `debug*`, `diagnostic`, `system-check`, and `internal/*` routes
were left as-is.

## Printify webhook fail-closed

`app/api/webhooks/printify/route.ts`:

- Missing `PRINTIFY_WEBHOOK_SECRET` → **503 `WEBHOOK_SECRET_NOT_CONFIGURED`**
  (previously failed *open* / allowed all requests).
- Missing or invalid signature → **401 `INVALID_SIGNATURE`**.
- HMAC compared with `crypto.timingSafeEqual` (length-checked).
- The raw body is never logged (`rawSnippet` removed).

## Petal authority

Endpoints no longer trust a client-supplied `amount` as ledger authority:

- `app/api/petals/route.ts` and `app/api/petals/earn/route.ts` map the
  client-supplied action/reason to a fixed, server-owned reward
  (`app/lib/petals/serverRewards.ts`) and route the grant through
  `grantPetals()`, which enforces per-source caps, daily caps, and rate limits
  via `PETAL_RULES`.
- `app/api/v1/petals/grant/route.ts`: `admin_grant` requires
  `authorizeAdminApi('clerk_admin_or_internal_service')`. All sources clamp the
  requested amount to server-owned source rules.
- `app/api/v1/petals/collect/route.ts`: requires auth; the client amount is a
  signal clamped server-side via `grantPetals`.
- `app/api/v1/petals/sync/route.ts`: pure reconciliation read. The
  `PetalWallet` is authoritative; the route no longer takes
  `Math.max(cloud, local)` and never writes client-supplied balances or
  transactions.

## Refund ledger delta

`app/api/webhooks/stripe/route.ts` `charge.refunded`: `charge.amount_refunded`
is cumulative. The ledger now records the **per-event delta** (preferring the
latest `charge.refunds.data[0].amount`, falling back to
`cumulative - previous_attributes.amount_refunded`) so multiple partial refunds
each post their incremental amount via `recordStripeRefundLedger`. The order
row still stores the cumulative total. Ledger idempotency keys include the
distinct Stripe `event.id`, so partial refunds are not deduplicated against each
other.

## Checkout state naming

`app/api/v1/checkout/session/route.ts` creates orders as `status: 'pending'`
pre-payment; the Stripe webhook moves them to `pending_fulfillment` after
payment truth. Clarifying comments were added documenting this
`pending` → `pending_fulfillment` transition as reconciliation-safe — no
behavior change.

## Environment flags

| Variable | Purpose |
|----------|---------|
| `INTERNAL_AUTH_TOKEN` | Internal-service bearer credential accepted by `authorizeAdminApi` / `authorizeProviderWrite` (timing-safe compare). |
| `API_KEY` | Legacy internal-service credential, accepted the same way. |
| `PRINTIFY_WEBHOOK_SECRET` | Required for the Printify webhook to accept any request (absence → 503). |
| `STAGING_CATALOG_SYNC_ENABLED` | Example staging-only flag usable with `authorizeProviderWrite({ requireEnvFlag })`. |
| `NODE_ENV` | `developmentOnly` mode opens test/debug routes only when `=== 'development'`. |

## Expected fail-closed behavior

- Unauthenticated provider-write / diagnostic requests → 401 (`AUTH_REQUIRED`)
  or 403 (`FORBIDDEN`) with an `x-otm-reason` header.
- Test/debug routes outside development without admin/internal auth → 404
  (`NOT_FOUND`) or 401/403.
- Printify webhook without a configured secret → 503; bad signature → 401.
- Petal grants ignore oversized client amounts (clamped to source rules);
  `admin_grant` without admin/internal auth → 401/403.

## Tests added

- `app/api/webhooks/printify/__tests__/signature.test.ts` — missing secret
  (503), missing signature (401), invalid signature (401), valid signature (200).
- `app/lib/petals/__tests__/grant-clamp.test.ts` — large in-range amounts clamp
  to `maxPerEvent`, out-of-range amounts rejected, daily-remaining clamp.
- `app/api/petals/__tests__/authority.test.ts` — `/api/petals` ignores client
  amount and grants the server reward; rejects unauthenticated callers.
- `app/api/v1/petals/__tests__/grant-admin.test.ts` — `admin_grant` requires
  admin/internal auth; normal sources do not.
- `app/api/webhooks/stripe/__tests__/dry-run.test.ts` — added a two-partial-
  refund case asserting per-event deltas (500, then 700).
- `scripts/commerce-release-static-checks.mjs` — appended static assertions for
  refund delta, petal server-reward routing, `admin_grant` gating, and that
  petal routes never write a ledger amount from the request body.

## Remaining known risks

- **Vercel frozen-install gap (not changed here).** `vercel.json` still uses
  `pnpm install --prod=false --no-frozen-lockfile`, so Vercel builds are not
  guaranteed to be reproducible against `pnpm-lock.yaml` (CI uses
  `--frozen-lockfile`). This PR intentionally does **not** change `vercel.json`.
  Proposed follow-up branch `ci/vercel-frozen-install-proof`: verify a frozen
  install succeeds in a Vercel preview, pin pnpm `10.15.1`, then flip
  `vercel.json` to `--frozen-lockfile` after preview verification.
- **Achievement / rune unlock criteria not verified.** Petal rewards from
  achievement/rune unlock paths still rely on their own server logic; the unlock
  criteria were not audited in this pass.
- **runId / session binding unimplemented.** Petal grants are bounded by source
  caps and rate limits but are not yet bound to a verified game run/session id,
  so true per-event idempotency for click/earn requires a schema field (no
  migrations in this PR).
- **Dual petal grant stacks.** Legacy `/api/petals/*` and canonical
  `/api/v1/petals/*` both exist; they now both route through `grantPetals`, but
  consolidating onto a single stack remains future cleanup.
