# Otakumori Aesthetic Direction

Use this document as the visual source of truth for UI styling agents. It is intentionally specific because Otakumori should not feel like a generic storefront, a Shopify theme, or a sterile SaaS dashboard.

## Founder aesthetic statement

Otakumori should feel like a playable, emotionally charged anime/game storefront: part PS2 memory card screen, part GameCube boot ritual, part late-night anime forum, part dreamy gothic shop window. It should be polished enough to trust with money, but strange enough that users feel like they found a hidden save file.

The site should carry a pink-gray-dark palette, soft sakura energy, liminal gaming nostalgia, and sharp anime attitude. It can be cute, sensual, eerie, funny, and a little corny in a controlled way. It should not feel childish, cluttered, or cheap.

The brand mood is:

```txt
nostalgic
liminal
anime-coded
gamer-native
softly gothic
pink-gray-dark
sakura-lit
slightly haunted
confident
playable
intimate but not submissive
premium enough for checkout trust
```

## What Otakumori is not

Avoid these aesthetics:

```txt
default Shopify theme
plain white marketplace
generic SaaS dashboard
overly bubbly kawaii store
soulless dropshipping page
crypto casino UI
cheap neon overload
random anime collage
unreadable death-metal chaos
mobile-hostile animation dump
```

The site can reference fandom culture, retro games, old anime, and fantasy UI patterns, but the final product must still be legible, shoppable, and trustworthy.

## Core visual language

### Color direction

Primary palette:

```txt
near-black charcoal
soft graphite gray
misty silver gray
muted sakura pink
deep rose pink
faint lavender glow
warm off-white text
small red/orange warning accents only where meaningful
```

Suggested tokens:

```txt
background: #0d0c10
surface: #15131a
surface-2: #1d1a24
border: rgba(255,255,255,0.10)
text: #f6edf4
muted-text: #b8aeba
pink: #f5a8c8
rose: #db5f93
lavender: #b9a7ff
soft-gray: #c9c4cf
warning: #f28c7b
```

Use pink like atmosphere, not like a highlighter on everything. Pink should glow around important edges, CTAs, active states, petals, profile frames, and soft particle moments.

### Shape language

Preferred:

```txt
rounded but not bubbly
soft rectangular cards
thin borders
subtle inner glow
panel-based layouts
memory-card/menu energy
small icon badges
hover states that feel like selecting a game menu item
```

Avoid:

```txt
huge pill buttons everywhere
sharp cyberpunk-only corners
flat unstyled boxes
excessive gradients on every card
```

### Texture and atmosphere

Good textures:

```txt
scanline softness
mist/fog overlays
sakura particles
subtle CRT bloom
faint gridlines
memory-card panels
old console selection glow
soft grain
rare rune-like accents
```

Do not overdo texture on checkout or admin pages. The deeper aesthetic belongs mostly to home, profile, GameCube, mini-games, and brand landing areas.

## Particle policy

Particles are part of Otakumori's identity. They are allowed and desired, especially on the homepage.

Allowed:

```txt
homepage hero particles
soft sakura petal drift
subtle dust/glow motes
controlled landing-page ambience
profile showcase ambience if lazy-loaded
GameCube/game areas if isolated
```

Forbidden:

```txt
/commerce-core
/commerce-core/cart
/commerce-core/checkout
checkout payment button area
admin tables
root layout
API routes
server components
```

Rules:

```txt
client-only
lazy/dynamic import with ssr:false
respect prefers-reduced-motion
reduce density on mobile
do not block first content paint
do not mount globally
clean up animation frames/listeners
no 3D/particle dependency added in styling PR unless already present and approved
```

Aesthetic target for homepage particles:

```txt
slow falling sakura petals mixed with tiny memory-glow motes, like a saved game menu at 2 a.m. after rain. Magical, light, not chaotic.
```

## Page-by-page aesthetic intent

### Homepage

Purpose: convert curiosity into brand trust and exploration.

Mood:

```txt
liminal anime-game landing page
soft sakura darkness
old console boot memory
premium fandom storefront
```

Should include:

```txt
hero section with controlled particles
strong brand statement
clear shop CTA
secondary explore/game/profile CTA
animated but calm hover states
visual depth through layered panels
```

Do not make homepage so heavy that mobile Chrome struggles. Use lazy visuals and fallback states.

### Shop/catalog

Purpose: browse products clearly.

Mood:

```txt
clean dark boutique
anime convention artist table but premium
soft card grid
clear pricing and product images
```

Styling priorities:

```txt
product cards should feel collectible
image containers should be consistent
prices must be easy to read
sale/limited labels should feel like game item tags
filters/search should be quiet and usable
```

Do not bury products under lore. Product clarity matters.

### Product detail

Purpose: make the item desirable and easy to buy.

Mood:

```txt
collectible item inspect screen
premium merch preview
soft dramatic framing
```

Styling priorities:

```txt
large product image
clear title/price
variant selector as item-choice UI
add-to-cart CTA obvious
shipping/production note readable
```

### Cart

Purpose: review and continue without anxiety.

Mood:

```txt
inventory screen
clean order review
```

Styling priorities:

```txt
line items readable
quantities obvious
subtotal clear
checkout CTA prominent
remove/update controls quiet but accessible
```

Do not add particles here. Keep cart stable and light.

### Checkout

Purpose: trust, clarity, no surprises.

Mood:

```txt
secure ritual, not boring bank form
minimal dark checkout panel
```

Styling priorities:

```txt
order summary clear
sign-in CTA clear
shipping/tax says Calculated at payment
errors are human-readable
payment button feels trustworthy
```

Forbidden:

```txt
heavy animations
particles
unclear tax/shipping promises
calling Stripe on page load
```

### Commerce Core

Purpose: lightweight testable store spine.

Mood:

```txt
boring but still Otakumori-coded
quiet dark panels
soft pink accents
fast and mobile-safe
```

Commerce Core can look branded, but it must not import global site systems.

Allowed:

```txt
static Tailwind styling
simple cards
local state UI
safe fallback product images
```

Forbidden:

```txt
Navbar
CartProvider
Clerk hooks
petals
games
GlobalSearch
avatars
community
particles
3D
```

### Account/profile

Purpose: make the user feel like they have an identity in the world.

Mood:

```txt
Steam profile meets anime character card
memory file
personal shrine
```

Styling priorities:

```txt
profile card
avatar frame
badges/achievements
recent activity
petal/rank/status display
clean edit/sign-out controls
```

Profile should eventually support avatar render modes, but do not load the full editor on every profile page.

### Avatar editor

Purpose: creation and self-expression.

Mood:

```txt
character creator screen
anime RPG customization menu
```

Styling priorities:

```txt
preview panel
controls grouped clearly
save/apply actions obvious
fallback state if avatar renderer fails
mobile-friendly controls
```

Do not move Clerk hooks into renderer components. The renderer should receive plain avatar props.

### GameCube / mini-games

Purpose: brand magic and retention.

Mood:

```txt
boot screen ritual
memory card mystery
playable hidden room
```

Styling priorities:

```txt
controlled animation
clear start/continue interaction
safe loading state
no global game registry in Navbar
lazy game scenes
```

This is where weirdness is allowed. Still clean up loops and audio on unmount.

### Admin

Purpose: operator confidence.

Mood:

```txt
dark control room
clear status board
not decorative-heavy
```

Styling priorities:

```txt
readable tables
status badges
error states
sync state clarity
orders/products/admin actions separated
```

No particles. No playful ambiguity on destructive actions.

## Microcopy tone

Tone should be playful but controlled.

Good:

```txt
Add to cart
Enter the shop
Continue checkout
Calculated at payment
Sign in to continue
Your order file is ready
```

Allowed occasional brand flavor:

```txt
Add to bottomless cart
Memory saved
Message received, commander
Continue the ritual
```

Avoid using jokes where clarity matters:

```txt
payment errors
shipping/tax
account auth
admin actions
order status
```

## Interaction feel

Buttons and cards should feel like selectable game menu items.

Preferred interactions:

```txt
soft glow on hover
slight lift
border brightening
subtle scale no more than 1.01 or 1.02
reduced-motion fallback
visible focus ring
```

Avoid:

```txt
large bouncing motion
constant pulsing CTAs
rapid particle bursts
animations that delay buying
```

## Typography

Use readable typography first. Decorative fonts should be accents, not body text.

Suggested hierarchy:

```txt
large expressive hero headings
clean sans body copy
small monospaced/game-system labels for badges/status
```

Keep product names, prices, checkout copy, and admin labels very readable.

## Responsive rules

Mobile is first-class.

Rules:

```txt
no horizontal scroll
no hover-only affordances
particle density reduced on mobile
checkout/cart controls thumb-friendly
profile/avatar panels stack cleanly
product cards keep image ratio stable
```

## Styling agent file targets

After PR #23 route migration is green, styling agents may target:

```txt
app/(site)/page.tsx
app/(site)/shop/**
app/(site)/cart/**
app/(site)/checkout/**
app/(site)/account/**
app/(site)/profile/**
app/(site)/admin/**
app/(site)/gamecube/**
app/(site)/mini-games/**
app/components/** visual components
app/commerce-core/_components/** styling only
```

Before PR #23 route migration is green, styling agents should avoid route folders being moved.

## Files styling agents must not touch

```txt
app/layout.tsx
app/(site)/layout.tsx
app/(commerce-core)/layout.tsx
middleware.ts
app/providers/**
app/api/**
prisma/**
Stripe API/server logic
Printify/Merchize sync logic
product/vendor normalization logic
CartProvider behavior
ClerkProviderWrapper behavior
FullAppShell provider order
```

## Success standard

The final styling should make Otakumori feel like:

```txt
a dark sakura-lit anime/game storefront that loads like a real business, sells like a trustworthy shop, and hides enough strange interactive energy to make users want to explore.
```

The money path stays stable. The homepage gets magic. The profile/game layers get personality. The admin area gets clarity.
