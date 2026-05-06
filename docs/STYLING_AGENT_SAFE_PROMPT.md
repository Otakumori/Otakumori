# Styling Agent Safe Prompt

Use this prompt for any secondary styling/UI agent while PR #23 is still stabilizing route architecture and Commerce Core.

## Core rule

Do not work on the same branch as the architecture/checkout agent.

Create a separate branch from the latest safe base. Recommended branch name:

```txt
ui-polish-safe-pass
```

Do not branch from an unstable half-migrated commit unless specifically instructed. If PR #23 is still in route migration, prefer waiting until PR #23 is green, then branch from the updated main or from the green PR head.

## Mission

Improve visual polish without changing runtime architecture, data flow, checkout behavior, providers, auth, product sync, or routing.

This is a styling-only pass. The goal is to make pages feel more cohesive and premium while avoiding changes that could break the build or interfere with Commerce Core isolation.

## Allowed changes

You may edit:

```txt
CSS/Tailwind classNames
spacing
layout rhythm
typography scale
button styling
cards
loading states
empty states
error message styling
responsive layout polish
non-functional copy refinements
static decorative components
safe image sizing
accessibility attributes if low-risk
```

Preferred targets after route migration is green:

```txt
app/(site)/shop
app/(site)/cart
app/(site)/checkout
app/(site)/account
app/(site)/profile
app/(site)/admin
app/(commerce-core)/commerce-core
app/commerce-core/_components
```

## Forbidden changes

Do not edit:

```txt
app/layout.tsx
app/(site)/layout.tsx
app/(commerce-core)/layout.tsx
middleware.ts
provider files
ClerkProviderWrapper
FullAppShell provider order
CartProvider behavior
Stripe API routes
checkout API logic
Printify/Merchize sync logic
Prisma schema
migration files
route folder locations
product/vendor normalization logic
Petal ledger or economy logic
GameCube runtime logic
mini-game runtime logic
avatar renderer architecture
```

Do not add:

```txt
new providers
new global imports
new route groups
new client-side data fetching in checkout
new API calls on page load
new animation loops
new 3D/canvas/particle effects
new dependencies
```

## Commerce Core styling rules

Commerce Core must stay lightweight.

Do not import:

```txt
Navbar
CartProvider
GlobalSearch
games.meta.json
Clerk hooks
petals
community
avatars
mini-games
3D/particles
```

Commerce Core styling may use static CSS/Tailwind, simple components, and existing local Commerce Core state only.

## Checkout styling rules

Do not change checkout behavior.

Allowed:

```txt
make checkout clearer
improve order summary readability
improve sign-in CTA styling
improve error message presentation
make shipping/tax text visually consistent
```

Forbidden:

```txt
calling Stripe on load
changing checkout payload structure
changing payment logic
hardcoding shipping cost
changing tax calculation language away from Calculated at payment unless real calculation is wired
```

## Profile/avatar styling rules

Allowed:

```txt
profile card styling
avatar frame styling
fallback/avatar placeholder styling
mobile layout polish
badges/achievement visual hierarchy
```

Forbidden:

```txt
rewriting avatar runtime
adding new renderer dependencies
adding canvas/3D work
moving Clerk hooks into renderer components
making profile load the full editor unnecessarily
```

## Admin styling rules

Allowed:

```txt
admin table/card readability
status badges
empty/error state styling
spacing and layout polish
```

Forbidden:

```txt
changing admin auth enforcement
changing order/product mutation behavior
adding destructive admin actions
changing database writes
```

## Build and validation

Before opening a PR, run:

```bash
pnpm typecheck
pnpm build
```

Manual checks:

```txt
/commerce-core
/commerce-core/cart
/commerce-core/checkout
/shop
/cart
/checkout
/account
/profile
/admin
```

Acceptance:

```txt
build passes
no route/provider changes
no new provider errors
Commerce Core remains isolated
checkout behavior unchanged
visual changes are scoped and reversible
```

## PR guidance

Open a separate PR titled:

```txt
UI polish pass without runtime changes
```

PR description must include:

```txt
- Styling-only scope
- Routes touched
- Confirmation no providers/routing/API/checkout logic changed
- Build result
- Screenshots before/after if possible
```

If a desired visual change requires data flow, route changes, provider changes, or new runtime behavior, stop and create a separate architecture ticket instead of sneaking it into the styling PR.
