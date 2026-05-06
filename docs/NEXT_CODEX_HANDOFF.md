# Next Codex Handoff

Branch: `commerce-core-skeleton`  
PR: #23

## Current mission

Finish Commerce Core isolation the correct way.

Do not keep adding one-off provider layouts. They were temporary triage. The final architecture must use route groups:

```txt
app/layout.tsx
  minimal root only

app/(site)/layout.tsx
  full Otakumori site shell

app/(commerce-core)/layout.tsx
  lightweight Commerce Core shell

app/api
  backend/API routes
```

## Read first

Before changing code, read these files:

```txt
docs/commerce-core-route-group-migration.md
docs/pr-23-route-migration-execution-runbook.md
docs/founder-platform-roadmap.md
```

They define the architecture, migration order, cleanup rules, and business sequencing.

## Preserve

Keep Commerce Core isolation work:

```txt
app/layout.tsx
app/(commerce-core)/layout.tsx
app/(commerce-core)/commerce-core/*
app/commerce-core/_components/*
public/assets/commerce-core/*
```

Keep site shell target:

```txt
app/(site)/layout.tsx
app/FullAppShell.tsx
app/providers/ClerkProviderWrapper.tsx
app/providers/FullClerkProviderWrapper.tsx
```

## Execute route migration

Use `git mv`, not manual copy/delete.

Move full-site routes into `app/(site)`:

```bash
git mv app/account app/'(site)'/account
git mv app/admin app/'(site)'/admin
git mv app/adults app/'(site)'/adults
git mv app/abyss app/'(site)'/abyss
git mv app/cart app/'(site)'/cart
git mv app/checkout app/'(site)'/checkout
git mv app/character-editor app/'(site)'/character-editor
git mv app/community app/'(site)'/community
git mv app/creator app/'(site)'/creator
git mv app/gamecube app/'(site)'/gamecube
git mv app/login app/'(site)'/login
git mv app/mini-games app/'(site)'/mini-games
git mv app/orders app/'(site)'/orders
git mv app/panel app/'(site)'/panel
git mv app/profile app/'(site)'/profile
git mv app/settings app/'(site)'/settings
git mv app/shop app/'(site)'/shop
git mv app/soapstone app/'(site)'/soapstone
git mv app/trade app/'(site)'/trade
git mv app/wishlist app/'(site)'/wishlist
```

If a folder has already moved or does not exist, inspect before continuing. Do not create duplicate route owners.

## Do not move

```txt
app/api
app/(commerce-core)
app/(site)
app/commerce-core/_components
app/layout.tsx
app/global-error.tsx
app/globals.css
app/not-found.tsx
app/robots.ts
app/sitemap.ts
middleware.ts
```

Also do not move shared code folders:

```txt
app/components
app/context
app/contexts
app/hooks
app/lib
app/providers
components
lib
hooks
providers
```

## Delete temporary triage after migration

After routes are under `app/(site)`, remove provider-only one-off layouts created during triage if they duplicate `app/(site)/layout.tsx`.

Likely cleanup targets:

```txt
app/(site)/account/layout.tsx
app/(site)/admin/layout.tsx
app/(site)/cart/layout.tsx
app/(site)/character-editor/layout.tsx
app/(site)/checkout/layout.tsx
app/(site)/community/layout.tsx
app/(site)/creator/layout.tsx
app/(site)/gamecube/layout.tsx
app/(site)/mini-games/layout.tsx
app/(site)/orders/layout.tsx
app/(site)/panel/layout.tsx
app/(site)/profile/layout.tsx
app/(site)/settings/layout.tsx
app/(site)/soapstone/layout.tsx
app/(site)/trade/layout.tsx
app/(site)/wishlist/layout.tsx
app/LegacySiteRouteLayout.tsx
```

Do not delete meaningful route-specific layouts if they contain unique UX or auth behavior. Fold meaningful behavior into route-specific inner components when needed.

## Abyss caution

Abyss had a client layout that used Clerk and petal context. Preserve Abyss-specific visual/nav behavior, but avoid nested `FullAppShell` after moving under `app/(site)`.

Final expectation:

```txt
app/(site)/abyss/layout.js
  route-specific Abyss shell only, no duplicate site provider wrapper

app/(site)/abyss/AbyssClientLayout.js
  client-only inner layout if needed
```

## Import rules

After route moves, fix broken relative imports. Prefer aliases:

```ts
import FullAppShell from '@/app/FullAppShell';
import ClerkProviderWrapper from '@/app/providers/ClerkProviderWrapper';
import { paths } from '@/lib/paths';
```

Do not import Commerce Core internals into full-site routes.

## Build sequence

Run:

```bash
pnpm typecheck
pnpm build
```

If provider errors occur, do not add a new route-specific provider layout. Instead verify the route lives under `app/(site)` and inherits `app/(site)/layout.tsx`.

If duplicate route errors occur, delete the old direct `app/<route>` owner and keep `app/(site)/<route>`.

If import errors occur, fix with path aliases where practical.

## Preview validation

Validate:

```txt
/commerce-core
/commerce-core/cart
/commerce-core/account
/commerce-core/checkout
/commerce-core/orders
/commerce-core/success
/cart
/checkout
/gamecube
/creator
/character-editor
/profile
/community
/shop
```

Acceptance:

```txt
Vercel build passes
/commerce-core has no Navbar/global providers
full-site routes inherit app/(site)/layout.tsx
no useUser/useCart/usePetalContext prerender errors
Commerce Core checkout does not call Stripe on page load
Commerce Core shipping and estimated tax say Calculated at payment
```

## Scope control

Do not touch in PR #23:

```txt
Stripe wiring
Printify/Merchize fulfillment
Petal ledger expansion
Avatar runtime rewrite
Game runtime rewrite
GameCube feature work
UI polish unrelated to build isolation
```

Those belong in later branches after PR #23 is green.
