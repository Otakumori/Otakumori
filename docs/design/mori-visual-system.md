# Mori Visual System

Last reviewed: 2026-07-25 from source baseline `21af5fff70aed71abf8bf21e830c5e460e43ba93`.

This is the canonical visual-system contract for Otakumori. Source code, tests, accessibility
evidence, and current deployment behavior still take precedence over prose. Historical visual PRs
and older design notes are reference material until their ideas are extracted against current
`origin/main`.

## Theme Statement

Otakumori is a dark sakura storybook marketplace: charcoal paper, warm ivory typography,
dusty-pink botanical illustration, fine engraved borders, and anime-fantasy relic presentation.
The homepage may be more cinematic than commerce pages, but every shop, product, cart, checkout,
order, profile, blog, community, and game surface should feel like another page or region in the
same world. Commerce clarity, accessibility, accurate product presentation, and trust are stronger
requirements than decoration.

Avoid generic SaaS styling, bright neon-pink gradients, glossy glassmorphism, large pill-heavy
components, heavy geometric headings, decorative fonts that hurt readability, and effects that make
shopping slower or less clear.

## Truth And Ownership

- Canonical document: `docs/design/mori-visual-system.md`.
- Shared implementation surface: `app/components/mori`.
- Token and utility layer: `app/globals.css`.
- Representative applied surfaces in this foundation: homepage hero, homepage route cards, navbar,
  shop listing shell, product cards, product detail shell, cart shell, checkout shell, and
  leaderboard unavailable state.
- This document does not authorize provider writes, checkout writes, Production deployments,
  database changes, or petal-economy activation.

## Palette

- Backgrounds: charcoal black, graphite, soot, very dark brown-black.
- Primary text: warm ivory or parchment, never stark white as the dominant text color.
- Accent: muted dusty sakura pink.
- Secondary ornament: aged taupe, faded bronze, warm gray, and desaturated brown.
- Occasional emphasis: deeper rose, dried-blood burgundy, or muted plum.

Target balance:

- 70-80% charcoal and black.
- 15-20% ivory, parchment, and warm gray.
- 5-10% sakura pink and deeper rose accents.

Pink should appear as an illustrated accent, border detail, hover state, petal, selected state, or
small CTA emphasis. It must not dominate every surface.

## Typography

Large headings use an elegant, high-contrast serif with generous spacing and warm ivory color.
Navigation and small interface labels use tracked uppercase serif or restrained small-cap treatment.
Body copy should remain readable and visually related to the storybook tone.

Avoid heavy geometric sans-serif headings, oversized bold UI text, cartoon fonts, and novelty fonts
for paragraphs, forms, checkout, or product decisions.

## Component Construction

Most surfaces should be thin outlined frames, not filled rounded cards. Cards should feel like
pages, relic displays, inventory slots, or framed illustrations. Border weight stays delicate.

Buttons are framed labels:

- rectangular or nearly rectangular
- thin outlined border
- dark interior
- centered serif label
- ivory text
- sakura or parchment hover treatment

Pill buttons are exceptional compact controls, not the default.

The reusable foundation currently lives in `app/components/mori` and includes page/container,
panel, frame, card, typography, button/link, badge, field, input/select/textarea, image frame,
loading, empty, error, unavailable, variant option, and decorative petal primitives.

## Navigation

Desktop navigation should feel like a literary header: small insignia, horizontal labels, generous
spacing, minimal chrome, and no oversized account-avatar pill. Mobile navigation should be a framed
dark drawer, not a generic light dropdown. Account and cart states remain clear and operational.

## Homepage

The homepage is the cinematic exception. It may use environmental art, layered atmosphere, subtle
parallax, branch-anchored petals, and storybook transitions. The current baseline uses
`public/assets/images/cherry-tree@1x.webp` as the live sakura tree scene.

Decorative petals are allowed, but they are not reward claims. Collectible petals must remain
separate until server-authoritative reward logic is implemented and accessible controls are
available.

## Commerce

The commerce path must keep clarity ahead of mood:

- Product photography remains accurate, large, and unobstructed.
- Product cards use actual product images inside relic frames.
- Prices, availability, product titles, selected variants, unavailable options, shipping
  information, return information, cart quantities, totals, and checkout actions must be
  unmistakable.
- Checkout is the most restrained version of the theme.

Shop landing and collection pages should feel like a curated archive, field journal, shrine
inventory, or illustrated merchant catalogue. Product detail should feel like opening a dedicated
catalogue folio for one artifact. Cart should feel like an inventory summary. Checkout should look
trusted and quiet.

## Profile And Account

Future OTA-25 work must pair identity architecture with visual states for private account identity
and public persona. Required states include sign-in continuity, onboarding, account hub, profile
creation, handle selection and availability, avatar/banner display, profile editor, privacy,
blocking, empty/new-user, mobile layout, and signed-in navbar identity.

## Community And Games

Community and game surfaces should expand the same world rather than become unrelated mini-sites.
Relevant motifs include soapstone comments, petal pouch, achievements, memory card, trade center,
music player, GameCube-style hub, progression, saves, seasonal effects, and time-of-day atmosphere.

## Motion

Motion should be slow, atmospheric, and deliberate:

- petal drift
- soft opacity changes
- gentle frame reveal
- subtle border illumination
- small hover lift only when useful

Avoid springy SaaS animation, fast particles, heavy 3D scenes, cursor trails, automatic audio,
motion that delays shopping, and effects over navigation, text, product controls, checkout fields,
or payment state.

Reduced-motion mode must stop or substantially calm decorative movement.

## Accessibility

Every visual PR must keep:

- keyboard focus visible
- persistent labels for forms
- semantic buttons and links
- accessible names for icon-only controls
- readable contrast
- reduced-motion behavior
- empty, loading, error, unavailable, and locked states
- mobile reachable actions

Visual personality is not a reason to hide labels or degrade screen-reader output.

## Petal Economy Surfaces

Petal UI is visual-only unless the server-owned PetalWallet path is verified. Current Production
has a known unrelated `/api/v1/leaderboards/global-petals` 500 caused by a missing PetalWallet
relation. Visual surfaces must not call that route repeatedly or imply balances, rewards, or
rankings are operational while that backend dependency is unresolved.

Use an unavailable state that says the feature is paused and keeps commerce usable.

## Asset Audit

Current usable or reference assets:

- `public/assets/images/cherry-tree@1x.webp`: 614x921 WebP, transparent, approximately 129 KB.
  This is the active homepage tree asset and is acceptable for the current scene.
- `public/assets/images/otakumori-sakura-hero.png`: 1024x1536 PNG, approximately 2.6 MB.
  Useful as high-resolution reference, but too large for casual page chrome without optimization.
- `public/media/cherry-tree.png`: 1024x1536 PNG, approximately 2.5 MB, transparent reference.
- `public/cherry-hero.svg`: lightweight reference ornament.
- `public/assets/ui/tree-sakura.svg`: lightweight illustrated tree reference.
- `public/assets/ui/petal.svg` and `public/assets/petal.svg`: lightweight petal references.
- `public/overlay/soapstone.png`: usable soapstone ornament reference.

Several legacy background PNG/JPG files are tiny placeholder-like artifacts or failed image parses
and should not become canonical visual assets without verification.

## PR 40 Audit

Draft PR #40, `Visual: implement Mori storybook homepage foundation`, is stale reference material.
It was based on `chore/commerce-schema-readiness-clean`, not current `main`, and must not be
merged directly.

Still-valid ideas extracted:

- dark paper and sakura atmosphere
- warm serif hero typography
- framed category/relic card language
- restrained CTA hierarchy
- decorative petal drift with reduced-motion handling
- smaller literary navigation

Deferred or rejected from direct reuse:

- any stale branch-specific code
- missing time-of-day asset assumptions
- preview collectible-petal mechanics before server authority
- page-specific styling that should be shared primitives
- incomplete global footer and typography cleanup

## Required Visual Evidence

Visual PRs must return screenshot or video evidence for representative desktop, tablet, and mobile
viewports. For commerce routes, evidence must include enough of shop/product/cart/checkout to prove
product image crop, variant/quantity clarity, cart totals, form labels, checkout action visibility,
loading/empty/error/unavailable states where applicable, and reduced-motion review.

## Validation

Use Tier 8 in `docs/repository-validation.md` for visual and UX changes. A visual PR must include
focused component/contract tests plus full Tier 3 validation when shared UI, commerce UI,
navigation, or layout primitives change.

## Deferred Work

- Extract any remaining valid homepage pieces from PR #40 only after comparing against current
  `main`.
- Move long-term homepage scene assets into a deliberate asset structure if needed.
- Add screenshot regression coverage once the route-level visual baseline stabilizes.
- Build OTA-25 profile/account visuals against this system.
- Expand the same visual language across storefront, account orders, community, blog, and games.
