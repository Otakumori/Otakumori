# ADR-002: Site Skeleton Runtime Boundaries

## Status

Accepted for the next site skeleton pass.

## Context

Otaku-mori needs a homepage that feels alive, fast, and emotionally coherent without loading gameplay or rendering runtimes that belong to deeper feature surfaces. The homepage Sakura tree scene is the public front door and should support cherry-blossom collection from the tree. Mini-games, avatar/game systems, and rich interactive surfaces can carry heavier runtime costs only after the user intentionally navigates to those routes.

UI and UX quality are treated as equal to sensitive-data safety: visual polish, responsiveness, accessibility, memory stability, collection integrity, and data isolation are all release blockers.

## Decision

The homepage remains static-first and server-first. It may use:

- canonical Sakura tree image assets
- CSS-only overlays
- capped CSS transform/opacity petal motion
- small local preview interaction events
- a thin authenticated collection session for homepage petals
- server-rendered route cards and CTAs

The homepage must not import or initialize:

- Pixi
- Three / React Three Fiber
- tsparticles
- game engine packages
- broad animation runtimes for simple effects
- full profile/account inventory hydration
- mini-game runtime modules
- purchase, achievement, or game reward processors

Mini-games and other feature routes may own heavier runtimes when the user explicitly navigates there. Those routes should lazy-load their engines, clean up timers/listeners/canvases on unmount, and respect reduced motion where animation is decorative.

## Petal Collection Boundary

Homepage tree petals are collectible, but the homepage should only know the minimum state needed to make collection feel responsive and safe.

Allowed on `/`:

- current authenticated collection eligibility snapshot
- anonymous/local preview collection state
- rate-limit/cooldown state for tree petals
- optimistic UI feedback for tap/click collection
- a narrow collection endpoint for homepage tree petals
- a small counter or summary label

Not allowed on `/`:

- full profile inventory hydration
- full account/account-settings fetches
- purchase reward processing
- achievement reward processing
- mini-game reward settlement
- wallet-style balance mutation from arbitrary client events
- grant APIs that trust only client-supplied petal IDs

Collection sources should share the same backend ledger concept but remain source-owned:

- homepage Sakura tree petals
- mini-game rewards
- achievement rewards
- purchase rewards
- event or campaign rewards

Each source should submit through a source-specific, server-validated claim path. The UI can share a lightweight collection summary, but reward authority stays on the server.

## Naming

Avoid naming the user-facing concept `wallet` unless the product intentionally wants a financial/crypto tone. Prefer softer names that fit Otaku-mori:

- Petal Pouch
- Blossom Pouch
- Petal Satchel
- Bloom Ledger
- Grove Ledger
- Sakura Satchel

Internal database/service language can still use ledger-style terms for correctness, idempotency, and auditing. User-facing UI should feel collectible, not financial.

## Interaction Model

Homepage petals should work across mouse, touch, pen, and keyboard-equivalent assistive flows.

- Use pointer events rather than mouse-only handlers.
- Keep hit targets comfortable on touch devices.
- Avoid placing collectible targets over nav, primary CTAs, or form controls.
- Use capped DOM nodes or a pooled canvas/SVG layer, not unbounded particles.
- Use transform/opacity animations only.
- Pause or heavily reduce motion when `prefers-reduced-motion` is enabled.
- Clean up timers, listeners, observers, and animation frames on unmount.
- Provide optimistic feedback immediately, then reconcile with the server claim result.

## Route Ownership

- `/` owns the public landing experience and homepage tree petal collection.
- `/shop` owns commerce catalog and product browsing.
- `/cart` and `/checkout` own cart and checkout only if already present.
- `/mini-games` owns gameplay discovery and game runtime entry.
- `/community` owns community surfaces and soapstone-style interactions.
- `/profile` owns personal state, progress, inventory, and account-facing surfaces.
- `/api/v1/*` owns stable API envelopes.

No duplicate route families should be introduced for shop, checkout, profile, or mini-games.

## Performance and Memory Guardrails

- Homepage JavaScript must stay minimal and route-scoped.
- Decorative animation must use transform and opacity only.
- Any animation loop must have an explicit cap and cleanup path.
- Reduced-motion users should receive static or near-static scenes.
- Homepage sections below the hero should be server-rendered by default.
- Below-fold sections should use browser containment where safe, such as `content-visibility: auto`.
- No external data request should occur on the homepage unless a feature flag and `safeFetch` path allow it.
- Authenticated homepage collection fetches should be small, cache-aware where safe, and never hydrate full account state.

## Data and Privacy Guardrails

- Homepage petal collection may call a narrow, authenticated, server-validated claim endpoint.
- Homepage route cards must not fetch privileged user data.
- Live data must remain behind `NEXT_PUBLIC_LIVE_DATA` and feature-specific flags unless the request is an authenticated first-party collection/session request.
- Sensitive flows stay in their owned routes and APIs.
- Collection claims need server-side idempotency, source validation, cooldown/rate limiting, and abuse resistance.

## Acceptance Criteria

A homepage PR is acceptable only if it:

- keeps core content readable without JavaScript-heavy effects
- avoids game/rendering runtime imports
- preserves clear route ownership
- allows only minimal authenticated petal collection state on `/`
- does not hydrate full profile/account state on `/`
- does not trust client-only grant events
- respects reduced motion
- has no unbounded timers, observers, canvases, or listeners
- keeps UI polish and interaction quality at the same priority level as security, collection integrity, and data safety
