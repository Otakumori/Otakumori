# ADR-001: Otaku-mori — Home Page Delivery (Phased)

## Scope

- Implement a data-driven, flag-gated Home experience while preserving the existing starfield, cherry tree sway, and decorative petals. Add interactive petals only in safe zones (hero + spacer) with proper hit-testing. Wire live data via a safe fetch utility with a master kill switch and probes.

## Constraints & Assumptions

- Keep visual stack intact: `app/components/GlobalBackground.tsx`, `app/components/tree/CherryTree.tsx` (imported by `GlobalBackground`), decorative `PetalLayer` behind content only.
- Interactive petals mounted only inside Home hero and spacer, using hit-test via `document.elementFromPoint` and never calling `preventDefault()`.
- Feature flags default safe (off), configurable via `.env` and surfaced via `process.env.NEXT_PUBLIC_*` through `env.mjs` accessors.
- Live data disabled by default; `lib/safeFetch.ts` governs probes, timeouts, and revalidation.
- Follow repo standards: App Router under `/app`, server components by default, RSC data fetch with `revalidate: 60`, Zod contracts in `/app/lib/contracts.ts` where new validation is needed, HTTP envelope for any new v1 routes.
- No new heavy animation/3D deps. Respect `prefers-reduced-motion` everywhere.

## Non-Functional Requirements (NFRs)

- Performance: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1; bundle delta per phase ≤ 35KB gz; 60fps target, only transform/opacity animations; no long tasks > 50ms.
- Accessibility: WCAG AA contrast; keyboard flows; aria-\*; `prefers-reduced-motion` fully honored (freeze starfield/sway/petals).
- Security: Strict CSP (no changes to providers/layout beyond mount points), avoid token leaks, CORS minimal, SameSite=Lax, validate inputs.
- Observability: Console-based telemetry shim for fetch sections, animation timing, and soapstone actions. Pluggable later.
- Testing: Unit (utils/hooks), component (critical sections), Playwright E2E for "no-rage-clicks" and reduced-motion.

## Phases

### Phase 0 — Planning & Guardrails

Deliverables:

- Create `docs/adr/ADR-001-homepage-delivery.md` with phases, budgets, acceptance criteria.
- Update `.env.example` with feature flags and comments:
  - `NEXT_PUBLIC_FEATURE_HERO=1`
  - `NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE=1`
  - `NEXT_PUBLIC_FEATURE_SHOP=0`
  - `NEXT_PUBLIC_FEATURE_MINIGAMES=0`
  - `NEXT_PUBLIC_FEATURE_BLOG=0`
  - `NEXT_PUBLIC_FEATURE_SOAPSTONES=0`
  - `NEXT_PUBLIC_LIVE_DATA=0`
  - `NEXT_PUBLIC_PROBE_MODE=1`
- Add `lib/safeFetch.ts`:
  - `safeFetch(input, { allowLive?: boolean; probeOnly?: boolean })`
  - If `probeOnly`, issue HEAD or GET `?probe=1` with 3–5s timeout.
  - If live is disabled and not `probeOnly`, return blocked result for CTA rendering.
  - If allowed and live is on, real fetch with `next: { revalidate: 60 }`, strict timeouts, no credentials, and response typing.
- Unit tests: `tests/lib/safeFetch.test.ts` with mocked envs (live off/on, probe only, timeouts).

Acceptance:

- ADR present; flags documented; `safeFetch` unit tested; no visual/runtime regressions.

### Phase 1 — Home Shell & Sections (Flag-Gated)

Edits (server-first):

- Keep current visuals; do not alter `GlobalBackground`/starfield, nor cherry/petal decorative layers.
- Home layout: Edit `app/page.tsx` to render sections in order: Hero → Spacer → Shop → Mini-Games → Blog → Footer (with Soapstones), all gated by flags.
- Decorative petals: Ensure global decor layer uses `pointer-events: none`, z-20 (behind content), e.g., reuse `app/components/PetalLayer.tsx` as background-only.
- Interactive petals: Mount a small, capped interactive `PetalLayer` replacement ONLY inside the hero container and spacer container (new client component, e.g., `components/hero/InteractivePetals.tsx`).
  - On click: perform hit-test `document.elementFromPoint(x, y)` and collect only if topmost element is the petal; never call `preventDefault()`.
  - Respect `prefers-reduced-motion` and cap counts: decor ≤ 40, interactive ≤ 12.
- Shop (server component): `app/(site)/home/ShopSection.tsx` reads `FEATURE_SHOP`.
  - `safeFetch('/api/v1/printify/products', { allowLive: true })` → fallback `safeFetch('/api/products?limit=12')` if live blocked or error.
  - Grid: `sm:1 md:2 lg:3`; card with image/title/price; link wraps card; empty state CTA "Explore Shop".
- Mini-Games (server): `app/(site)/home/MiniGamesSection.tsx` reads `FEATURE_MINIGAMES`.
  - Try sequentially: `/api/games`, `/api/mini-games`, `/api/games/featured` via `safeFetch`.
  - Render ≤ 6 tiles (title, art, link to `/mini-games`), else singular CTA.
- Blog (server): `app/(site)/home/BlogSection.tsx` reads `FEATURE_BLOG`.
  - `safeFetch('/api/blog/latest?limit=3')` (fallback to `/api/blog/posts?limit=3` and slice client-side if limit unsupported).
- Footer + Soapstones: `app/(site)/home/FooterSection.tsx`.
  - If `FEATURE_SOAPSTONES`: Composer (search-bar style) POST `'/api/soapstone'` with client idempotency key; wall GET `'/api/soapstone/messages?take=10'` shows teasers (expand on click).
  - If live off: composer submit disabled with note.

Acceptance:

- Visual: hero → spacer → petals drift behind; nav remains readable.
- Interaction: product/blog/game card clicks are never intercepted by petals.
- Data: sections render live when enabled; graceful fallbacks otherwise; no mock data in production paths.
- A11y: keyboard + SR flows; reduced-motion respected.
- Perf: budgets met; bundle delta ≤ 35KB gz.

### Phase 2 — Routing, Mapping, Textures, Animations Polish

- Routing links: ensure `/shop/[id]`, `/mini-games` and `/mini-games/games/[slug]`, `/blog/[slug]` linked and prefetch where safe.
- Image/Texture: Prefer WebP; ensure `next.config.mjs` includes external image domains or proxy; define `sizes` and lazy-load by default.
- Animations: Sway amplitude ±0.5deg, ±2–4px; pause on `document.hidden`; adhere to `prefers-reduced-motion`.
- Petal pools: enforce caps and recycle nodes.
- Canopy emit points: compute from `CherryTree` bounds with slight jitter; align to front-layer branch clusters.

Acceptance:

- No jank on low-end mobile; stable timing; reduced-motion looks intentional.
- Images optimized; safe prefetch does not hurt INP.
- Canopy emit positions feel believable.

### Phase 3 — API Handling, Webhooks Health, Errors

- Do not modify existing API handlers; add client/server guards:
  - Timeouts, `AbortController`, retry (×2, jitter), strict typing, undefined guards.
  - User-facing errors: soft messages + CTAs.
- Add `/internal/health` (dev/secret only): shows webhook liveness (last success ts masked) from existing webhook logs or in-memory health.
- Client idempotency for Soapstones (header `x-idempotency-key` + localStorage dedupe window) to avoid double submits.

Acceptance:

- All fetches typed and guarded; no unhandled rejections.
- Health page is dev-safe and non-sensitive.
- Soapstone POSTs idempotent client-side.

### Phase 4 — Testing, CI, Quality Gates

- Unit: `safeFetch` behavior; petal spawn math bounds; any `useWind` or wind-equivalent bounds if present.
- Component: grids/cards render with/without data; composer disabled state.
- E2E (Playwright):
  - "No-rage-clicks": Clicking visible product card always navigates; petals collect only in hero/spacer.
  - Reduced-motion snapshot: no running animations, visuals intact.
- CI: Add `.github/workflows/ci.yml` with tsc --noEmit, eslint ., next build; cache deps; attach Lighthouse and bundle analyzer artifacts for preview deploy.

Acceptance:

- CI green; tests pass; Lighthouse + bundle diff attached to PR.

### Phase 5 — Observability & Rollout

- Add `lib/telemetry.ts` shim: dev logs via `console` for events like `shop.fetch.success`, `petal.collect`, `soapstone.post`.
- Rollout: draft PR → preview deploy; update PR description per phase completion with: what changed, risks, mitigations, perf numbers, suppressions if any; optional automerge label post-approval.

Acceptance:

- Telemetry events emitted without PII; vendor swap-ready.
- PR includes preview link and checklist.

## Acceptance Criteria (Global)

- Hero visuals preserved; clickable petals only in safe zones with hit-test gating; live sections flag-gated; SSR/ISR strategy applied; clear error states.
- Meets perf, a11y, security, observability, and testing NFRs per phase.

## Performance Budgets

- LCP: ≤ 2.5s
- INP: ≤ 200ms
- CLS: ≤ 0.1
- Bundle delta per phase: ≤ 35KB gzipped
- Animation target: 60fps, transform/opacity only
- Long tasks: ≤ 50ms

## Risk Mitigation

- Visual regressions: Preserve existing components, add new ones alongside
- Performance impact: Bundle size monitoring, lazy loading, animation caps
- Data failures: Graceful fallbacks, probe mode, user-friendly error states
- Accessibility: WCAG AA compliance, reduced motion support, keyboard navigation
- Security: No token leaks, input validation, CSP compliance
