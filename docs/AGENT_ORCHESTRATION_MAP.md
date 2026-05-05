# Agent Orchestration Map

This document maps which agent should work on which part of Otakumori so concurrent work does not break the architecture.

## Recommended tool roles

### Architecture / checkout agent

Best fit:

```txt
Codex or Claude Code in a real local workspace
```

Use for:

```txt
route-group migration
provider boundary cleanup
git mv folder moves
pnpm typecheck
pnpm build
checkout/cart/API hardening
Clerk/account/admin access
product normalization
Stripe handoff preparation
```

Reason: this work needs file moves, build feedback, import repair, and careful repo-wide reasoning.

### Styling / UI polish agent

Best fit:

```txt
Claude Code, OpenCode, Vicoa AI, or another UI-focused code agent
```

Use for:

```txt
Tailwind class polish
spacing
typography
cards
responsive layouts
empty states
error states
safe decorative styling
homepage visual atmosphere
```

Must be a separate branch from the architecture work.

### Product strategy / founder planning agent

Best fit:

```txt
ChatGPT / planning session
```

Use for:

```txt
feature sequencing
launch scope
drop strategy
pricing logic
retention loops
avatar/game/petal roadmap
business model clarity
```

Do not let planning sessions directly mutate code unless the requested change is already scoped.

## Branch policy

### Active architecture branch

```txt
commerce-core-skeleton
```

Purpose:

```txt
PR #23
route architecture
Commerce Core isolation
build green
checkout stability baseline
```

Only one architecture agent should work here at a time.

### Safe styling branch

Recommended branch:

```txt
ui-polish-safe-pass
```

Create it only after one of these is true:

```txt
PR #23 is green
or
branch from the exact latest PR #23 head and avoid files touched by the architecture agent
```

Styling branch must not touch routing/provider/API/payment/data files.

### Future feature branches

```txt
feat/commerce-core-stripe-tax-ledger
feat/product-vendor-normalization
feat/avatar-runtime
feat/game-runtime-isolation
feat/petal-ledger
feat/admin-ops-dashboard
```

Each branch gets one job.

## File ownership map

### Architecture-owned files

Only architecture agent should edit:

```txt
app/layout.tsx
app/(site)/layout.tsx
app/(commerce-core)/layout.tsx
middleware.ts
app/FullAppShell.tsx
app/providers/*
app/api/**
prisma/**
lib/paths.ts
checkout/cart server actions or API routes
Stripe-related files
Printify/Merchize integration files
```

### Commerce Core-owned files

Architecture/checkout agent owns behavior. Styling agent may only touch safe classes after approval.

```txt
app/(commerce-core)/commerce-core/**
app/commerce-core/_components/**
public/assets/commerce-core/**
```

Hard rule: Commerce Core must not import global site systems.

### Styling-safe files

Styling agent may edit these after route migration is stable:

```txt
app/(site)/shop/**
app/(site)/cart/**
app/(site)/checkout/**
app/(site)/account/**
app/(site)/profile/**
app/(site)/admin/**
app/(site)/page.tsx or homepage components
app/components/** visual-only components
app/styles/** if present
app/globals.css with caution
```

Allowed styling edits:

```txt
Tailwind className changes
spacing
font scale
cards
buttons
responsive layouts
loading states
empty states
error states
static decorative wrappers
```

Forbidden styling edits:

```txt
providers
routing
middleware
server actions
API routes
checkout payloads
Stripe calls
product/vendor sync
Prisma schema
new dependencies
new global imports
```

## Particle policy

Particles are allowed because Otakumori's homepage should feel atmospheric and alive.

But particles must be scoped.

### Allowed particle surfaces

```txt
homepage hero
site landing sections
controlled event/seasonal landing page
optional profile showcase if lazy-loaded
GameCube/game surfaces if isolated from Commerce Core
```

### Forbidden particle surfaces

```txt
/commerce-core
/commerce-core/cart
/commerce-core/checkout
/cart payment-critical interactions unless extremely lightweight and disabled on low-memory
/admin
API routes
root layout
checkout API/client payment button area
```

### Particle implementation rules

```txt
particles must be client-only
particles must be dynamically imported with ssr:false
particles must not mount from app/layout.tsx
particles must not mount from app/(commerce-core)/layout.tsx
particles must respect prefers-reduced-motion
particles must be disabled or simplified on mobile/low-memory
particles must not block content rendering
particles must clean up animation frames/listeners on unmount
```

Recommended pattern:

```tsx
const HomeParticles = dynamic(() => import('@/app/components/visual/HomeParticles'), {
  ssr: false,
  loading: () => null,
});
```

The homepage can have magic. The checkout spine must stay boring and stable.

## Agent sequencing

### Step 1: Architecture agent

```txt
complete PR #23 route migration
remove one-off provider layouts
pnpm typecheck
pnpm build
Vercel green
```

### Step 2: Checkout agent

```txt
Stripe Checkout
Automatic Tax
webhook order persistence
idempotent order ledger
checkout failure states
```

### Step 3: Product sync agent

```txt
normalize Printify/Merchize products
server-trusted prices
variant/vendor mapping
safe unavailable states
```

### Step 4: Styling agent

```txt
home/shop/cart/checkout/account/profile/admin polish
homepage particles under safe policy
no runtime or provider changes
```

### Step 5: Avatar/game agents

```txt
avatar runtime isolation
game runtime lazy loading
petal ledger
GameCube runtime improvements
```

## Merge policy

Do not merge a styling PR while the architecture PR is failing unless the styling branch is rebased after the architecture PR and build passes.

Do not mix Stripe, routing, particles, and profile rewrites in one PR.

Every PR must answer:

```txt
What system does this own?
What files did it touch?
What did it intentionally not touch?
What build/test passed?
What route was manually checked?
```
