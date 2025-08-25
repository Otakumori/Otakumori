# Cursor Project Rules — Otakumori (PROD)

## Architecture

- Next.js App Router only. Pages, layouts, and route handlers under /app.
- Auth: Clerk. Do not import next-auth or supabase. Never suggest them.
- DB: Prisma + Neon (Postgres). No Drizzle for new code. Keep existing Drizzle files untouched.
- Storage: Vercel Blob for files. No Supabase storage.
- Email: Resend.
- Payments: Stripe.
- Jobs: Inngest.
- Data fetching: React Query (@tanstack/react-query) with SSR prefetch & hydrate.
- All API handlers are versioned under /app/api/v1/* and return the envelope:
  { ok: true, data: T } | { ok: false, error: string }

## Mandatory patterns

- Validate client responses with Zod schemas in /app/lib/contracts.ts.
- All Prisma/Stripe/Blob admin routes must include: export const runtime = "nodejs";
- All mutating requests send an 'x-idempotency-key' header and routes enforce it via IdempotencyKey table.
- Client components never import Prisma, fs, Stripe, or Node APIs.
- Server components do not call React hooks. If hooks are needed: split into a client child with "use client".
- Use absolute imports via "@/..." (tsconfig baseUrl/paths).
- Env access via env.mjs only. Do not read process.env directly in app code.
- All images use next/image unless a clear reason exists (SVG as component).
- No Supabase imports. If found, replace with Prisma or Blob.

## File structure expectations

- Contracts: /app/lib/contracts.ts
- HTTP wrapper: /app/lib/http.ts
- Client hooks: /app/hooks/api.ts
- DB singleton: /app/lib/db.ts
- Providers: /providers.tsx (Clerk + React Query + custom providers)
- Routes: /app/api/v1/**/route.ts

## Code quality

- TypeScript strict mode. No 'any' unless justified with comment.
- ESLint errors must be 0 for changed lines. Warnings acceptable temporarily.
- Prefer small, composable route files; reuse contracts and http wrapper.

## What to do when uncertain

- Follow the patterns above. Do not introduce new libraries or paradigms without explicit user approval.
