# Environment Variable Handling

This document defines how environment variables and secrets are managed for
Otaku-mori. It exists to keep secrets out of Git, reduce secret-scanner noise,
and meet enterprise-readiness expectations.

## Core rules

1. **Env files must never be committed.** No `.env`, `.env.local`,
   `.env.production`, `.env.staging`, `.env.vercel`, or any other file
   containing real values may be tracked in Git. The only env file that is
   tracked is `.env.example`, which contains **placeholders only**.
2. **Local developers use `.env.local`.** Copy `.env.example` to `.env.local`
   and fill in your own development values:

   ```bash
   cp .env.example .env.local
   ```

   `.env.local` is gitignored and stays on your machine.
3. **Vercel owns Preview and Production env vars.** Preview and Production
   values are configured in the Vercel project dashboard
   (Project → Settings → Environment Variables), scoped per environment. They
   are never read from a committed file.
4. **Production env must be managed in provider dashboards, not Git.** The
   source of truth for production secrets is the issuing provider's dashboard
   (Stripe, Clerk, Printify, Neon, Upstash, Resend, Inngest, Vercel Blob, etc.)
   and Vercel's environment settings — never a file in this repository.
5. **Never paste secrets anywhere they can be captured.** Do not put real
   secret values into issues, pull requests, documentation, commit messages,
   AI prompts, screenshots, terminal recordings, or logs. If a secret is
   exposed in any of these surfaces, treat it as compromised and rotate it.

## How the app reads env vars

Application code reads configuration through `env.mjs` (validated with Zod via
`@t3-oss/env-nextjs`). Do not read `process.env` directly in app code; add the
variable to `env.mjs` and consume it from there. `.env.example` should be kept
in sync with the variables declared in `env.mjs`.

## Where each environment gets its values

| Environment            | Source of values                                  | Tracked in Git? |
| ---------------------- | ------------------------------------------------- | --------------- |
| Local development      | `.env.local` (copied from `.env.example`)         | No              |
| Vercel Preview         | Vercel dashboard (Preview scope)                  | No              |
| Vercel Production      | Vercel dashboard (Production scope) + providers   | No              |
| Example / placeholders | `.env.example`                                    | Yes (no values) |

## If a secret is exposed

1. **Rotate at the provider first.** Provider-side rotation is the only true
   remediation for an exposed secret — removing a file from Git does not
   un-expose a value that was already published.
2. Update the new value in Vercel (Preview/Production) and in any local
   `.env.local` files.
3. Remove the offending file from tracking and confirm `.gitignore` covers it.
4. See `docs/security/env-rotation-checklist.md` for the per-provider list.

## Related

- `.env.example` — placeholder template (safe to commit).
- `docs/security/env-rotation-checklist.md` — rotation checklist by provider.
- `.gitignore` — ignore rules for all env files.
