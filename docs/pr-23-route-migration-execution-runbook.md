# PR #23 Route Migration Execution Runbook

Branch: `commerce-core-skeleton`  
PR: #23

This runbook exists because PR #23 now contains both the correct Commerce Core isolation work and several temporary provider-boundary patches created during build triage. The final PR should keep the architectural isolation and remove the duct-tape layouts once full-site routes are moved under `app/(site)`.

## Current branch reality

The changed files currently fall into four buckets.

### Bucket A: Preserve Commerce Core isolation

Keep these changes. They are the point of PR #23.

```txt
app/layout.tsx
app/(commerce-core)/layout.tsx
app/(commerce-core)/commerce-core/page.ts
app/(commerce-core)/commerce-core/cart/page.ts
app/(commerce-core)/commerce-core/account/page.tsx
app/(commerce-core)/commerce-core/checkout/page.tsx
app/(commerce-core)/commerce-core/orders/page.ts
app/(commerce-core)/commerce-core/success/page.ts
app/commerce-core/README.md
app/commerce-core/_components/CommerceCoreCheckoutActions.tsx
app/commerce-core/_components/CommerceCoreShell.tsx
app/commerce-core/_components/README.md
app/commerce-core/_components/config.ts
app/commerce-core/_components/pages.tsx
public/assets/commerce-core/core-hoodie.svg
public/assets/commerce-core/core-sticker.svg
public/assets/commerce-core/core-tee.svg
```

Commerce Core must remain separate from the full site shell. Do not add Clerk, Navbar, CartProvider, GlobalSearch, petals, minigames, avatars, community, 3D, or particles to `app/(commerce-core)`.

### Bucket B: Preserve the full site shell target

Keep this file, but make sure imports are stable after migration.

```txt
app/(site)/layout.tsx
app/FullAppShell.tsx
app/providers/ClerkProviderWrapper.tsx
app/providers/FullClerkProviderWrapper.tsx
```

`app/(site)/layout.tsx` should be the one full-site provider boundary. It should wrap full-site routes with `ClerkProviderWrapper` and `FullAppShell`.

### Bucket C: Remove temporary one-off provider layouts after migration

These were added during triage to fix one failed prerender at a time. They should not survive as final architecture if their folders are moved under `app/(site)`.

After the folder move, delete these if they only duplicate the site shell:

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
```

Also delete this helper if nothing imports it after the migration:

```txt
app/LegacySiteRouteLayout.tsx
```

Important: delete only after moving the route folders into `app/(site)`. If deleted before moving, builds will continue failing with missing provider errors.

### Bucket D: Review/revert non-essential cleanup

These changes are not the main acceptance gate for Commerce Core isolation and should be reviewed separately. Keep only if they are harmless and build-confirmed.

```txt
package.json
middleware.ts
```

Known concern: earlier browser-data dependency edits accidentally pinned `baseline-browser-mapping` lower than what Vercel already had. If dependency cleanup is not required for PR #23, defer it to a separate maintenance PR. Commerce Core isolation should not be blocked on caniuse/baseline warnings.

## Full-site folders to move

Use `git mv`, not manual copy/delete.

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

If any command fails because the folder does not exist or has already moved, do not create duplicates. Inspect the path and continue.

## Keep in root app

Do not move these:

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

Also do not move shared implementation folders just because they live under `app/`:

```txt
app/components
app/context
app/contexts
app/hooks
app/lib
app/providers
```

Those are shared code, not route ownership.

## Abyss special handling

The branch currently added:

```txt
app/abyss/AbyssClientLayout.js
app/abyss/layout.js
```

This was a triage split because the original `app/abyss/layout.js` was a client layout using `useUser` and `usePetalContext`. After moving `app/abyss` to `app/(site)/abyss`, it already inherits the site provider tree.

Recommended final form:

```txt
app/(site)/abyss/layout.js
  may keep Abyss-specific nav/visual shell if needed
  should not wrap ClerkProviderWrapper + FullAppShell again
  can render AbyssClientLayout as an inner section if preserving Abyss UX

app/(site)/abyss/AbyssClientLayout.js
  can remain client-only if it needs usePathname/useUser/usePetalContext
  will be safe because app/(site)/layout.tsx wraps it above
```

Avoid nested `FullAppShell` inside Abyss after the move unless there is a deliberate UX reason.

## Import repair checklist

Moving route folders one level deeper can break relative imports.

Prefer aliases:

```ts
import FullAppShell from '@/app/FullAppShell';
import ClerkProviderWrapper from '@/app/providers/ClerkProviderWrapper';
import { paths } from '@/lib/paths';
```

Common relative import repairs after move:

```txt
../providers/ClerkProviderWrapper      -> '@/app/providers/ClerkProviderWrapper'
../FullAppShell                        -> '@/app/FullAppShell'
../../providers                        -> '@/providers' or '@/app/providers' depending source
../../../commerce-core/_components/... -> keep Commerce Core imports only in app/(commerce-core)
```

Do not import Commerce Core internals into full-site routes.

## Delete stale route entrypoints

After move, ensure these old direct folders no longer exist as route owners:

```txt
app/account
app/admin
app/adults
app/abyss
app/cart
app/checkout
app/character-editor
app/community
app/creator
app/gamecube
app/login
app/mini-games
app/orders
app/panel
app/profile
app/settings
app/shop
app/soapstone
app/trade
app/wishlist
```

Root `app/commerce-core` may remain only as an internal `_components` holder. It must not contain route pages or layouts.

## Build and validation sequence

Run in order:

```bash
pnpm typecheck
pnpm build
```

If build fails with missing provider errors, do not add one-off layouts. Instead, confirm the failing route lives under `app/(site)` and inherits `app/(site)/layout.tsx`.

If build fails with import errors, fix imports using aliases.

If build fails because two paths resolve to the same public URL, delete the old direct route owner and keep the route under `app/(site)`.

## Manual preview validation

Validate these URLs:

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

Expected:

```txt
/commerce-core has no Navbar and no global shell
/commerce-core does not load CartProvider, Clerk hooks, petals, games, community, 3D, or particles
full-site routes load under app/(site)/layout.tsx
no useUser/useCart/usePetalContext provider errors
Commerce Core checkout does not call Stripe on page load
Commerce Core shipping and estimated tax say Calculated at payment
```

## Revert strategy

If the migration goes sideways, do not merge partial folder moves. Revert only the route-migration commit(s), then keep the original Commerce Core isolation work as the baseline.

Safe baseline to preserve:

```txt
app/layout.tsx minimal root
app/(site)/layout.tsx full shell
app/(commerce-core)/layout.tsx lightweight
app/(commerce-core)/commerce-core routes
app/commerce-core/_components internal support
```

## Final PR hygiene

Before marking PR #23 ready:

```txt
remove temporary one-off layouts
remove app/LegacySiteRouteLayout.tsx if unused
update PR description to reflect route-group migration, not header-based detection
confirm no middleware/header workaround is required for Commerce Core isolation
confirm Vercel preview is green
```
