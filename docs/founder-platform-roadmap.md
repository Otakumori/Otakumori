# Otakumori Founder Platform Roadmap

This document is the operator-level plan for turning Otakumori from a broad creative prototype into a stable, revenue-capable platform.

The core strategic rule is simple: the money path must be stable before the immersive systems are allowed to expand. Avatars, petals, games, GameCube UI, community, trading, and visual effects are part of the brand magic, but they must never be able to crash browsing, cart, checkout, account, or orders.

## Platform thesis

Otakumori is a direct-to-consumer fandom commerce platform with an engagement layer. The store sells original anime/gaming-inspired goods, but the long-term moat is the interactive identity system around those goods: profiles, avatars, petals, achievements, mini-games, unlocks, and drop participation.

That means the business has four platform spines:

```txt
Revenue spine:
  catalog
  cart
  checkout
  Stripe
  orders
  fulfillment
  support

Identity spine:
  auth
  account
  profile
  avatar
  badges
  public profile card

Engagement spine:
  petals
  mini-games
  GameCube UI
  community
  trading
  seasonal events

Operations spine:
  admin
  vendor mapping
  Printify/Merchize
  webhooks
  observability
  analytics
  security
```

The next development cycle should separate these spines so each one can evolve without breaking the others.

## Phase 1: Route architecture stabilization

Goal: make runtime ownership explicit.

Required:

```txt
app/layout.tsx
  minimal root only

app/(site)/layout.tsx
  full Otakumori shell

app/(commerce-core)/layout.tsx
  lightweight commerce runtime

app/api
  backend/API runtime
```

Success criteria:

```txt
Vercel build passes
/commerce-core loads on mobile Chrome
/commerce-core does not mount Navbar/global providers
full-site routes inherit app/(site)/layout.tsx
no useUser/useCart/usePetalContext prerender failures
```

This is PR #23's main job. Do not expand scope into Stripe, Printify, Merchize, pets, games, avatars, or UI polish until this is green.

## Phase 2: Commerce Core revenue proof

Goal: prove a customer can browse, cart, sign in, checkout, and produce an order record.

Build in order:

```txt
1. stable cart persistence
2. signed-out checkout guard
3. Stripe Checkout handoff
4. Stripe Automatic Tax
5. webhook verification
6. order persistence
7. order status page
8. failure/expired checkout states
9. email receipt/support handoff
```

Do not connect fulfillment until payment and order ledger behavior is stable.

Success criteria:

```txt
checkout only calls Stripe after button click
shipping/tax are calculated at payment
successful payment creates exactly one order
webhook is idempotent
failed/expired payment is understandable
orders are visible to the signed-in customer
```

## Phase 3: Vendor and fulfillment integrity

Goal: make vendor fulfillment safe and traceable.

Required objects:

```txt
Product
Variant
VendorSkuMap
PrintProvider
FulfillmentOrder
FulfillmentEvent
```

Rules:

```txt
Printify/Merchize must not be called directly from checkout UI
vendor calls happen after paid order validation
vendor SKU mapping must be explicit
customer-facing order status must not depend on vendor API availability
```

Success criteria:

```txt
paid order can map to vendor SKU
fulfillment request is idempotent
vendor errors are logged and recoverable
admin can identify unfulfilled orders
```

## Phase 4: Avatar identity runtime

Goal: turn avatars into reusable identity infrastructure, not a one-page editor.

Architecture:

```txt
AvatarModel
AvatarPresenter
AvatarRenderMode
AvatarAssetRegistry
AvatarFallback
GameAvatarAdapter
ProfileIdentityCard
```

Render modes:

```txt
profile-card
profile-portrait
mobile-lite
mini-game-sprite
game-lobby
achievement-pose
shop-static
```

Rules:

```txt
avatar renderer does not call Clerk directly
editor may use Clerk, renderer receives plain props
profile pages do not load the full editor
browser-only renderers use dynamic imports with ssr:false
fallback renderer always exists
```

Success criteria:

```txt
public profile can render an avatar safely
avatar editor refresh does not crash
mobile uses lightweight fallback when needed
games can request avatar presentation without owning avatar logic
```

## Phase 5: Petal ledger

Goal: make petals auditable before expanding rewards.

Required ledger fields:

```txt
userId
eventType
amount
source
reason
idempotencyKey
relatedOrderId
relatedActivityId
createdAt
```

Rules:

```txt
no silent petal mutation
no duplicate reward on refresh
purchase rewards depend on paid order state
manual admin adjustments must be logged
```

Success criteria:

```txt
every petal change is explainable
order rewards are idempotent
profile displays balance from ledger-derived state
```

## Phase 6: Game runtime isolation

Goal: keep mini-games and GameCube identity strong without damaging performance.

Architecture:

```txt
app/(games) or app/(site)/mini-games with isolated GameRuntimeProvider
games.nav.json for lightweight navigation
games.full.json for full route-level metadata
dynamic imports per game
cleanup rules for loops/audio/events
```

Rules:

```txt
Navbar must not import full game registry
search should lazy-load game index on demand
no game loop before user interaction
all animation frames and intervals must clean up on unmount
```

Success criteria:

```txt
mini-games hub does not load every game bundle
game routes do not crash mobile Chrome
route changes stop loops/audio/listeners
```

## Phase 7: Launch readiness

Launch with fewer stable systems, not every planned system.

Minimum launch:

```txt
Commerce Core checkout
small original-IP product drop
basic account/orders
simple email capture
basic profile shell
clear support/contact path
analytics/monitoring
```

Do not require:

```txt
full GameCube UI
full petal economy
full trading system
full avatar game transforms
complex fulfillment automation
```

Success criteria:

```txt
customer can buy without confusion
founder can see what happened
support can resolve order issues
mobile does not crash
analytics identify funnel drop-off
```

## Phase 8: Growth and retention

Once revenue proof exists, expand the branded loop:

```txt
drops
seasonal avatar cosmetics
profile frames
petal rewards
mini-game events
limited bundles
email/SMS retention
community showcases
```

Growth should be measured by:

```txt
sessions
add-to-cart rate
checkout start rate
purchase conversion
AOV
repeat purchase rate
email capture rate
return visitor rate
petal engagement rate
profile completion rate
```

## Founder rule

Do not let the most exciting system break the most important system.

The boring spine funds the weird magic. Build the spine first, then layer the magic safely.
