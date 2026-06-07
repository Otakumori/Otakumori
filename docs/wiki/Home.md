# Otaku-Mori Wiki

Otaku-Mori is a production commerce and community platform built around anime, gaming, interactive rewards, and provider-backed fulfillment.

This wiki is the operating manual for the repository. It should explain how the system works, how to deploy it safely, how to validate changes, and how to recover when something breaks.

## Current system snapshot

| Area | Current choice |
| --- | --- |
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk |
| Database | Prisma with PostgreSQL |
| Payments | Stripe |
| Fulfillment | Printify with manual and disabled modes available |
| Hosting | Vercel |
| Email | Resend |
| Cache / state | Redis where configured |
| Testing | Vitest and Playwright |

## Primary wiki pages

| Page | Purpose |
| --- | --- |
| [Architecture](Architecture) | Explains the major application layers and service boundaries. |
| [Repository Structure](Repository-Structure) | Explains where code belongs and how the repo is organized. |
| [Environment Variables](Environment-Variables) | Documents required secrets and runtime configuration without exposing values. |
| [Local Development](Local-Development) | Explains how to install, run, validate, and test locally. |
| [Deployment](Deployment) | Explains Preview and Production deployment expectations. |
| [Commerce System](Commerce-System) | Documents catalog, checkout, webhook, fulfillment, and accounting flow. |
| [Security Model](Security-Model) | Documents route protection, provider-write rules, webhook validation, and diagnostics policy. |
| [Database](Database) | Documents Prisma models and migration expectations. |
| [CI and Quality Gates](CI-and-Quality-Gates) | Documents required checks, baseline gates, and known constraints. |
| [Runbooks](Runbooks) | Provides incident response steps for common failures. |
| [ADRs](ADRs) | Records architecture decisions and why they were made. |

## Documentation rules

Do not commit secrets, tokens, private keys, webhook secrets, database URLs, customer data, or raw provider payloads into this wiki.

Prefer exact commands over vague instructions. When a command is environment-specific, label it clearly as local, preview, or production.

When behavior changes, update the relevant wiki page in the same pull request as the code change.

## Quick command reference

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Use `pnpm` unless a specific script or provider requires a different command.
