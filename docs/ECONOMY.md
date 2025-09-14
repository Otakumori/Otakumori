# Petal Economy

## Principles
- Single wallet per user; immutable ledger entries for every credit/debit.
- PetalSource enum per transaction for auditability.
- Caps: per‑day and per‑source with server‑side rate limiting.
- Spends are atomic with entitlement grants.

## Data
- Wallet: balance, updatedAt.
- Ledger: (userId, delta, source, refId, createdAt) with indexes on (userId, createdAt).
- Entitlements: unique (userId, sku).

## Awards (examples)
- Mini‑game score submission: award = min(50, floor(score/10)) with RL (e.g., 6/min) and daily cap.
- Clicker/Home: small awards with tighter caps.

## Anti‑Abuse
- Upstash RL, jitter on award routes, server‑side math only.
- Optional device fingerprint or hCaptcha for heavier endpoints.

