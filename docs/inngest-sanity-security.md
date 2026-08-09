# Inngest and Sanity Credential Hygiene

This repository must not contain deployable provider credentials.

## Required Runtime Variables

- `INNGEST_EVENT_KEY`: managed in the provider and Vercel environment settings.
- `INNGEST_SIGNING_KEY`: managed in the provider and Vercel environment settings.
- `SANITY_WEBHOOK_SECRET`: managed in the Sanity webhook configuration and Vercel environment settings.

Use placeholders in local examples:

```env
INNGEST_EVENT_KEY=<set-in-provider>
INNGEST_SIGNING_KEY=<set-in-provider>
SANITY_WEBHOOK_SECRET=<set-in-provider>
```

## Operational Rules

- Do not commit `.env`, `.env.local`, `.env.production`, backup env files, provider exports, or credential dumps.
- Do not print, hash, compare, or otherwise disclose provider credential values in diagnostics.
- Do not use Vercel Protection Bypass credentials for routine validation.
- Use provider dashboards or Vercel environment metadata for name and scope verification only.
- Rotate provider credentials through provider-native secret managers, not repository scripts.

## Webhook Behavior

The Sanity webhook receiver must fail closed when `SANITY_WEBHOOK_SECRET` is missing. A missing secret is a server configuration error and must not fall back to an empty-string HMAC key.

Inngest health checks must remain coarse and non-mutating. They should not send synthetic business or health events to prove readiness.
