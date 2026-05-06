# Vicoa AI First Prompt

Use this as the first prompt for a local/desktop coding agent that can edit the repository, run `git mv`, install dependencies, execute builds, and inspect failures.

```txt
You are acting as the lead full-stack engineer for Otakumori, a Next.js/Vercel e-commerce platform with Clerk auth, Prisma database access, Stripe checkout, Printify/Merchize product/vendor integrations, user profiles, avatar/game/community systems, and a lightweight Commerce Core route that must remain isolated.

Your job is not to add random features. Your job is to make the site deploy successfully and create a stable money path with a professional architecture.

Repository context:
- Repo: Otakumori/Otakumori
- Branch: commerce-core-skeleton
- PR: #23
- Platform: Next.js App Router on Vercel
- Auth: Clerk
- DB: Prisma-backed database
- Payments: Stripe Checkout / Stripe Tax target
- Product/vendor sources: Printify and Merchize, but vendor calls must not happen directly from checkout UI
- Current blocker pattern: app/layout.tsx was correctly made minimal to isolate /commerce-core, but legacy full-site routes still sit directly under app/ and throw missing provider errors during prerender.

Before editing code, read these files in this order:
1. docs/NEXT_CODEX_HANDOFF.md
2. docs/pr-23-route-migration-execution-runbook.md
3. docs/commerce-core-route-group-migration.md
4. docs/founder-platform-roadmap.md

Primary objective:
Bare minimum working deploy with:
- Vercel build passing
- /commerce-core isolated and mobile-safe
- full-site routes under app/(site) inheriting the full provider shell
- Clerk sign-in working
- profile/account access working
- cart and checkout routes stable
- admin access stable
- product data consistently sourced through a normalized catalog/vendor layer
- shipping/tax clearly represented as calculated at payment until Stripe/vendor-backed calculation is wired
- no provider errors during prerender

Step 1: Fix routing architecture first.
Do not continue one-off provider layout patching.
Use route groups:

app/layout.tsx
- minimal root document only
- imports globals.css
- returns html/body
- no Clerk
- no Navbar
- no CartProvider
- no AuthProvider
- no ToastProvider
- no NSFWProvider
- no AppQueryProvider

app/(site)/layout.tsx
- owns the full Otakumori runtime
- ClerkProviderWrapper
- FullAppShell
- Navbar/global providers through FullAppShell

app/(commerce-core)/layout.tsx
- lightweight Commerce Core runtime
- no providers
- no Navbar
- no Clerk
- no CartProvider

Use git mv to move full-site route folders into app/(site), preserving public URLs:
- app/account -> app/(site)/account
- app/admin -> app/(site)/admin
- app/adults -> app/(site)/adults
- app/abyss -> app/(site)/abyss
- app/cart -> app/(site)/cart
- app/checkout -> app/(site)/checkout
- app/character-editor -> app/(site)/character-editor
- app/community -> app/(site)/community
- app/creator -> app/(site)/creator
- app/gamecube -> app/(site)/gamecube
- app/login -> app/(site)/login
- app/mini-games -> app/(site)/mini-games
- app/orders -> app/(site)/orders
- app/panel -> app/(site)/panel
- app/profile -> app/(site)/profile
- app/settings -> app/(site)/settings
- app/shop -> app/(site)/shop
- app/soapstone -> app/(site)/soapstone
- app/trade -> app/(site)/trade
- app/wishlist -> app/(site)/wishlist

Do not move:
- app/api
- app/(commerce-core)
- app/(site)
- app/commerce-core/_components
- app/layout.tsx
- app/global-error.tsx
- app/globals.css
- app/not-found.tsx
- app/robots.ts
- app/sitemap.ts
- middleware.ts
- shared code folders like app/components, app/context, app/contexts, app/hooks, app/lib, app/providers, components, lib, hooks, providers

After the route move, delete temporary provider-only layouts that duplicate app/(site)/layout.tsx behavior. Do not delete meaningful route-specific layouts if they contain unique UX. For Abyss, preserve Abyss-specific UI, but do not double-wrap FullAppShell inside app/(site)/abyss.

Step 2: Repair imports professionally.
After moving routes, fix broken relative imports. Prefer aliases instead of deep ../ chains:

import FullAppShell from '@/app/FullAppShell';
import ClerkProviderWrapper from '@/app/providers/ClerkProviderWrapper';
import { paths } from '@/lib/paths';

Do not import Commerce Core internals into full-site routes.

Step 3: Run build gates.
Run:
- pnpm typecheck
- pnpm build

If build fails with provider errors, do not add a new one-off layout. Confirm the failing route is under app/(site) and inherits app/(site)/layout.tsx.
If build fails with duplicate route ownership, delete the old direct app/<route> owner and keep app/(site)/<route>.
If build fails with imports, fix aliases and rerun.

Step 4: Stabilize bare-minimum checkout path.
Once the routing build passes, inspect the active checkout/cart/account implementation and ensure:
- user cannot final-checkout unless signed in, or receives clear sign-in CTA
- checkout does not call Stripe on page load
- checkout calls Stripe only after explicit user action
- shipping and estimated tax show “Calculated at payment” unless real Stripe/vendor shipping/tax calculation is fully wired
- cart persists through normal navigation and refresh
- order success/failure routes are present and clear
- all checkout API responses return valid JSON with safe error handling
- no “Unexpected end of JSON input” failure is possible from empty API responses

Step 5: Product/vendor consistency.
Create or verify a normalized product layer so UI does not directly depend on Printify/Merchize response shapes.
The storefront/cart/checkout should consume normalized product/variant data:

Product:
- id
- slug
- title
- description
- imageUrl
- active
- source/vendor metadata only where needed

Variant:
- id
- productId
- sku
- title/size/color
- price
- imageUrl
- vendorProvider
- vendorProductId
- vendorVariantId

Rules:
- Product fetching can sync from Printify/Merchize into internal normalized records.
- Checkout uses internal normalized records, not raw vendor responses.
- Vendor calls must not happen directly from checkout UI.
- Prices used for Stripe must come from the trusted server/catalog layer.
- If vendor API fails, the site should not crash. Show safe fallback or mark product unavailable.

Step 6: Clerk/account/profile/admin access.
Verify:
- sign-in route works
- sign-out works
- account route requires auth
- profile route can render for signed-in user
- public profile route does not require loading the full avatar editor
- admin route is protected and does not prerender with missing ClerkProvider
- server auth checks use Clerk server helpers where appropriate
- client components using useUser/useAuth are always under ClerkProvider through app/(site)/layout.tsx

Step 7: Admin access.
Bare minimum admin should allow the operator to inspect:
- products/catalog sync state
- orders
- failed checkout/order events
- fulfillment status placeholders
- customer/account reference if needed

Do not build large admin features in this pass. Just make existing admin safe and deployable.

Step 8: Shipping access.
Bare minimum shipping handling:
- customer-facing checkout says “Calculated at payment”
- Stripe Checkout/Automatic Tax branch is the future source of payment-time tax/shipping finalization
- do not hardcode $5 shipping
- do not promise delivery rates that are not actually calculated
- if a shipping profile/address form exists, guard it and persist only after the architecture is stable

Step 9: Scope limits.
Do not expand these in this pass:
- Petal ledger expansion
- full avatar runtime rewrite
- full mini-game runtime rewrite
- GameCube feature work
- Printify/Merchize fulfillment automation beyond normalized product sync safety
- new UI polish unrelated to deployment or checkout stability

Step 10: Final validation.
After changes, run:
- pnpm typecheck
- pnpm build

Then manually verify:
- /commerce-core
- /commerce-core/cart
- /commerce-core/account
- /commerce-core/checkout
- /commerce-core/orders
- /commerce-core/success
- /cart
- /checkout
- /sign-in or /login depending current route
- /account
- /profile
- /admin
- /shop

Acceptance standard:
- Vercel deploys successfully
- Commerce Core does not load Navbar/global providers
- full-site routes inherit app/(site)/layout.tsx
- no useUser/useCart/usePetalContext provider errors
- Clerk sign-in works
- profile/account/admin do not crash
- product data is normalized before checkout
- checkout only calls Stripe after button click
- checkout/server APIs always return valid JSON
- shipping/tax language is accurate

Work like a senior full-stack engineer. Prefer boring stability over cleverness. Preserve existing intent, but remove architectural duct tape. The money path comes first.
```
