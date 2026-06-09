# Secret Rotation Checklist

Use this checklist when a secret may have been exposed (committed, pasted into a
PR/issue/log/prompt, or otherwise leaked) or as part of routine rotation.

**This file lists provider categories only. Never record actual secret values
here.** Provider-side rotation is the only true remediation for an exposed
secret; removing a file from Git does not un-expose a value that was already
published.

## How to use

For each affected category below:

1. Generate a new secret in the provider's dashboard.
2. Revoke / delete the old secret at the provider.
3. Update the value in Vercel (Preview and/or Production scope).
4. Update any local `.env.local` files.
5. Verify the affected feature still works after rotation.

## Provider categories

- [ ] **Stripe** — secret key, webhook signing secret, publishable key.
- [ ] **Printify** — API key, webhook secret, shop ID reference.
- [ ] **Clerk** — secret key, webhook secret, encryption key, publishable key.
- [ ] **Neon / Postgres** — database connection strings (pooled and direct),
      database role passwords.
- [ ] **Prisma / Accelerate** — Accelerate API key (if applicable).
- [ ] **Resend** — API keys (including any admin keys), from-address config.
- [ ] **Upstash** — Redis REST URL and REST token.
- [ ] **Inngest** — event key, signing key, serve URL.
- [ ] **Vercel Blob** — read/write token and base URL.
- [ ] **EasyPost** — API key, webhook secret.
- [ ] **Algolia** — admin API key, search key, app ID.
- [ ] **Sanity** — read token, webhook secret, project/dataset references.
- [ ] **Sentry** — auth token, DSN.
- [ ] **Analytics (PostHog / GA)** — project/API keys.
- [ ] **Internal API keys / cron secrets / auth salts** — `API_KEY`,
      `INTERNAL_AUTH_TOKEN`, `CRON_SECRET`, `PETAL_SALT`, `AUTH_SECRET`.
- [ ] **Supabase (legacy)** — service role key and anon key, if still present.

## After rotation

- [ ] Confirm no real values remain in Git tracking (only `.env.example`
      placeholders are tracked).
- [ ] Confirm `.gitignore` still covers all env files.
- [ ] Confirm Preview and Production deployments read from Vercel/provider
      dashboards, not from committed files.
- [ ] Note the rotation in the security log / incident record (no values).

## Related

- `docs/security/env-handling.md` — env handling rules.
- `.env.example` — placeholder template.
