# Commerce Core Route Group Migration Manifest

Target PR: #23  
Branch: `commerce-core-skeleton`

## Executive decision

Stop one-off provider layout patching. The correct architecture is a route-group migration that separates the full Otakumori site runtime from the lightweight Commerce Core runtime.

The current build failures are not isolated page bugs. They are symptoms of legacy full-site routes still living directly under `app/` after `app/layout.tsx` was correctly reduced to a minimal root document. Those legacy routes use `useUser`, `useCart`, `usePetalContext`, avatar hooks, game hooks, or global shell components that require the full site provider tree.

## Target architecture

```txt
app/layout.tsx
  minimal document only
  imports globals.css
  returns html/body
  no Clerk
  no Navbar
  no CartProvider
  no AuthProvider
  no ToastProvider
  no NSFWProvider
  no AppQueryProvider

app/(site)/layout.tsx
  full Otakumori site runtime
  ClerkProviderWrapper
  FullAppShell
  Navbar/global providers through FullAppShell

app/(commerce-core)/layout.tsx
  lightweight commerce runtime
  no providers
  no Navbar
  no Clerk
  no CartProvider

app/(commerce-core)/commerce-core/*
  isolated Commerce Core routes
```

Route groups do not affect public URLs. For example, `app/(site)/gamecube/page.tsx` still renders at `/gamecube`.

## Move into `app/(site)/`

Move these route folders with `git mv`:

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

Also move any other non-api, non-commerce-core, full-site route folder that imports provider-dependent surfaces such as Clerk, cart, petal, avatar, community, mini-game, GameCube, profile, or global shell components.

## Do not move

Keep these in place:

```txt
app/api
app/(commerce-core)
app/commerce-core/_components
app/layout.tsx
app/global-error.tsx
app/globals.css
app/not-found.tsx
app/robots.ts
app/sitemap.ts
middleware.ts
```

Also keep shared component/library folders in place unless a separate cleanup PR intentionally relocates them:

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

## Remove temporary one-off layouts after route move

These layouts were emergency triage for missing providers. Once the route folders are inside `app/(site)`, delete these if they only wrap with `LegacySiteRouteLayout` or duplicate `(site)/layout.tsx` behavior:

```txt
app/(site)/creator/layout.tsx
app/(site)/profile/layout.tsx
app/(site)/community/layout.tsx
app/(site)/orders/layout.tsx
app/(site)/wishlist/layout.tsx
app/(site)/settings/layout.tsx
app/(site)/trade/layout.tsx
app/(site)/soapstone/layout.tsx
app/(site)/panel/layout.tsx
app/(site)/gamecube/layout.tsx
app/(site)/cart/layout.tsx
app/(site)/checkout/layout.tsx
app/(site)/character-editor/layout.tsx
```

Delete `app/LegacySiteRouteLayout.tsx` after the route-group migration if nothing still imports it.

Do not delete meaningful route-specific layouts that do more than provider wrapping unless their behavior is intentionally folded into a client inner layout. Special case: `abyss` currently had client layout behavior. Preserve its visual/nav behavior either as a child layout/component inside `app/(site)/abyss` or as a client inner component, but it should still inherit the site provider tree from `app/(site)/layout.tsx`.

## Import repair rules

After moving route folders deeper by one path segment, fragile relative imports may break. Prefer path aliases for shared app modules.

Use these patterns:

```ts
import FullAppShell from '@/app/FullAppShell';
import ClerkProviderWrapper from '@/app/providers/ClerkProviderWrapper';
import { paths } from '@/lib/paths';
```

Avoid adding more `../..` chains where practical.

## Provider rules

`app/(site)/layout.tsx` owns the full site provider stack once.

`app/(commerce-core)/layout.tsx` stays lightweight and must not import:

```txt
Navbar
CartProvider
GlobalSearch
games.meta.json
Clerk hooks
petal systems
minigames
avatars
community
3D/particles
```

## Build validation

Run:

```bash
pnpm build
```

Then verify the preview:

```txt
/commerce-core
/commerce-core/cart
/commerce-core/account
/commerce-core/checkout
/commerce-core/orders
/commerce-core/success
/gamecube
/creator
/character-editor
/cart
/checkout
/profile
/community
/shop
```

Acceptance:

```txt
Vercel build passes
/commerce-core renders without Navbar/global providers
/gamecube, /creator, /character-editor, /cart, /checkout, /profile, /community inherit app/(site)/layout.tsx
No useUser/useCart/usePetalContext provider errors during prerender
Commerce Core checkout does not call Stripe on page load
Commerce Core shipping and estimated tax say Calculated at payment
```

## Deployment stance

This route migration should be one coherent commit or a small sequence of commits using `git mv`, not dozens of manual file recreations. That keeps history reviewable and avoids accidental route deletion.

Professional rule: route groups are the system. One-off provider layouts are triage and should not be the final architecture.
