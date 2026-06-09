# Mori Visual System

Implementation contract for the public-facing Otaku-mori visual language. This document defines how most pages should look and behave before broad UI refactors begin.

**Status:** Specification only. No runtime implementation in this lane.

**Related documents:**

- `docs/design/homepage-design-system.md` — existing homepage token and typography notes
- `docs/storyboards/homepage.md` — homepage identity and interaction storyboard
- `docs/design/avatar-visual-contract.md` — avatar art direction and mini-game placement

---

## Visual north star

Otaku-mori should feel like a **dark storybook anime-commerce boutique** — not a generic SaaS storefront, not a glossy modern mobile-game hub, and not a collage of unrelated widgets.

The experience should evoke:

- a shrine catalog or relic shop at dusk
- an old-game menu with restrained PS1-era influence
- charcoal paper, warm ivory ink, and muted sakura accents
- ornamental framing, thin borders, and tactile cards
- weather-like motion, not particle-benchmark spectacle

**Do:**

- charcoal / ink base surfaces with subtle paper texture
- muted sakura pink as accent, not dominant neon
- warm ivory serif typography for display and body hierarchy
- thin ornamental borders and relic-style cards
- shrine / catalog / game-menu mood across shop, blog, and account surfaces
- clickable cherry blossoms that feel collectible and on-palette
- time-of-day background scenes that change atmosphere without hijacking content

**Do not:**

- default to bright white SaaS dashboards or glassmorphic startup landing pages
- use glossy plastic UI, candy gradients, or hyper-saturated mobile-game chrome
- treat emoji as functional UI icons unless explicitly decorative and accessibility-safe
- stack competing neon gradients, clashing pinks, or low-contrast body copy
- let decorative effects block navigation, CTAs, forms, or readable content

---

## Color system

### Core palette

| Role | Direction | Usage |
| --- | --- | --- |
| Ink base | Deep charcoal / near-black (`#080611` family) | Page background, primary surfaces |
| Paper texture | Subtle warm gray grain over ink base | Hero panels, cards, framed sections |
| Sakura accent | Muted sakura pink (`sakura.*` tokens in `tailwind.config.js`) | Highlights, borders, petal accents, CTA emphasis |
| Ivory text | Warm off-white / ivory | Primary readable copy |
| Secondary text | Soft zinc / muted lavender-gray | Labels, metadata, helper copy |
| Violet atmosphere | Restrained violet glow | Background mood only — never dominant on cards |
| Border line | Low-opacity white or sakura-tinted stroke | Ornamental frames, card edges, dividers |

### Rules

- Prefer existing Tailwind theme tokens (`sakura.*`, `glass.*`, `primary.*`, `accent.*`, `text.*`, `bg.*`, `border.*`) before one-off hex values.
- Sakura pink is an accent layer, not a fill for every interactive element.
- Maintain WCAG AA contrast for all body copy and controls.
- Avoid neon-heavy gradients, saturated CTA stacks, and clashing pink/purple pairs in the same viewport.

---

## Typography

### Font roles

| Role | Token / class | Usage |
| --- | --- | --- |
| Display / hero | `font-display` | Headlines, storybook titles, large framed CTAs |
| Body | `font-body` | Paragraphs, product descriptions, section copy |
| UI labels | `font-ui` | Eyebrows, nav labels, button text, metadata |
| Rare accent | `font-princeps`, `font-runic` | Ornamental moments only — never body paragraphs |

### Rules

- Warm ivory serif hierarchy for public copy. The site should read as premium and soft first, game-aware second.
- Do not use pixel, medieval, or novelty fonts for normal body text.
- Avoid mixing multiple novelty fonts in one viewport.
- Public-facing copy must speak to travelers and shoppers — not describe repository architecture, API routes, or framework choices.
- Preserve approved microcopy from project content standards; do not paraphrase protected strings in implementation.

---

## Layout and framing

### Page skeleton

- Centered storybook layout with constrained max-width for reading comfort.
- Generous vertical rhythm between hero, sections, and footer.
- Ornamental category tiles and relic-style section frames.
- Consistent border radius, blur depth, shadow weight, and border opacity across cards.
- Footer present on all routes; header sticky with single render — no duplicates.

### Framing language

- Thin ornamental borders around major sections (hero, shop preview, sign area).
- Cards feel like catalog relics or shrine inventory plaques — not flat Material cards.
- Background scenes sit behind content; foreground content always wins contrast and focus.
- Exclusion halos around inputs, links, buttons, and primary CTAs so decorative layers never block interaction.

---

## Cards and product surfaces

### Relic card standard

Product, blog, and game preview cards should share:

- dark ink base with subtle glass or paper depth
- thin low-opacity border (white or sakura-tinted)
- restrained hover lift — not bouncy mobile-game scale
- readable title in ivory; metadata in secondary tone
- image frames with consistent aspect treatment and no glossy bevel

### Shop surfaces

- Catalog grids should feel like a curated shrine inventory, not an infinite-scroll marketplace template.
- Price, badge, and CTA hierarchy must remain scannable at a glance.
- Avoid default e-commerce patterns that read as generic Shopify themes.

---

## Navigation

- Sticky header with proper z-index layering above decorative backgrounds.
- Active route highlighting consistent with Mori palette.
- Petal counter / pouch affordance uses glass styling with muted sakura glow — not neon badge chrome.
- Mobile navigation remains touch-friendly with 44px minimum targets.
- Breadcrumbs and back navigation preserve prior state where applicable.

---

## Homepage hero expectations

The homepage hero is the public front door. It must feel like opening a storybook catalog, not reading a developer README.

### Layout

- Centered storybook composition with ornamental category tiles.
- Large framed **Shop** CTA as a primary commerce entry — visually dominant but not SaaS-button generic.
- Supporting tiles for Mini-Games, Blog, and community/sign areas with consistent relic framing.
- Sakura tree or branch motif may anchor one side; content remains readable and centered.

### Copy direction

Use traveler-facing language:

- Welcome and invitation tone ("Welcome home, wanderer" and approved variants).
- Section titles that describe experiences (shop arrivals, game realm, fellow travelers).
- No architecture diagrams, stack lists, or "built with Next.js" messaging in the hero.

### Visual elements

- Clickable petals that visually match the muted sakura palette.
- Decorative petal images, SVG shapes, or CSS forms — all marked accessibility-safe (see below).
- Background scene that shifts by time of day (see Time-of-day behavior).
- Soapstone / sign section retains approved microcopy and scroll target behavior.

### Out of hero scope for this contract

- Implementing new hero components (follow-up: `visual/mori-storybook-homepage`).
- Changing protected microcopy without explicit approval.
- Adding WebGL, physics engines, or unbounded particle systems.

---

## Clickable cherry blossom behavior

### Purpose

Clickable petals are a signature interaction — collectible, soft, and on-brand. They are not generic confetti.

### Visual

- Muted sakura pink tones aligned with `sakura.*` tokens.
- Soft edges; optional subtle ink outline; no glossy 3D plastic look.
- Opacity capped over H1/CTA zones (≤ 0.75) so copy stays readable.
- Average drift rate ~1–2 petals per second with occasional gusts; never particle-storm density.

### Interaction

- Comfortable pointer and touch target (minimum 44px effective area where clickable).
- Immediate local feedback on press (scale, shimmer, or brief sakura burst).
- Petal Pouch / counter pulse on successful collection.
- Server reconciliation quietly confirms or rolls back — UI must not assume success before response.
- Exclusion zones around nav, CTAs, forms, and route cards.

### Accessibility

- Clickable petals must have an accessible name, e.g. `aria-label="Collect sakura petal"`.
- Decorative non-interactive petals use `aria-hidden="true"` and must not be focusable.
- Keyboard users must have an equivalent collection path if petals are materially rewarding (document in implementation PR).
- Do not rely on color alone to indicate collectibility.

---

## Time-of-day background behavior

### Purpose

Background scenes reinforce the storybook shrine mood without competing with foreground content.

### Modes

| Period | Atmosphere | Content rules |
| --- | --- | --- |
| Dawn | Soft lavender-pink sky, low contrast | Lighten paper texture slightly |
| Day | Balanced charcoal base, muted highlights | Default readability reference |
| Dusk | Warm violet-sakura gradient atmosphere | Accent glow restrained |
| Night | Deep ink, subtle star or lantern hints | Highest contrast for ivory text |

### Rules

- Derive period from user-local time or a documented server-safe fallback (single default image if time unavailable).
- Use optimized responsive images (`next/image`) with reserved layout space to prevent CLS.
- Background transitions respect `prefers-reduced-motion` (instant swap or static default — no slow crossfade).
- Foreground ornamental frames and cards maintain fixed contrast regardless of background period.
- Background must not reduce text below WCAG AA contrast.

---

## Accessibility rules

- WCAG AA minimum contrast for normal text; AAA preferred for small metadata where feasible.
- All interactive elements keyboard reachable with visible `focus:ring-2 focus:ring-pink-500` (or equivalent) focus indicators.
- Semantic HTML first; ARIA second.
- Images require descriptive `alt` text; decorative SVGs use `aria-hidden="true"`.
- Forms use explicit labels — never placeholder-only labeling.
- Live regions (`role="status"`, `aria-live="polite"`) for dynamic collection feedback.
- Screen readers must not announce decorative petals, glyphs, or emoji used as ornament.
- Touch targets ≥ 44px on mobile.
- Test at 200% zoom without layout breakage.

---

## Motion and reduced-motion rules

### Allowed motion

- CSS `transform` and `opacity` drift for petals
- Subtle hover lift on cards and CTAs
- Small sakura burst on petal collection
- Gentle Petal Pouch pulse on confirmation

### Disallowed motion

- Route-global game loops on marketing pages
- WebGL scene setup for decorative chrome
- Physics engines for homepage petals
- Unbounded particle creation
- Animation libraries where CSS suffices

### `prefers-reduced-motion: reduce`

- Disable petal drift; show static petal art or no decorative petals.
- Disable parallax and background crossfades; use static time-of-day image or neutral default.
- Retain functional state changes (hover/focus) without spatial movement.
- GameCube boot sequence remains skippable per loader-boot standards.

---

## Reusable component recommendations

Implementation PRs should introduce shared primitives rather than one-off page styling.

| Primitive | Responsibility |
| --- | --- |
| `MoriSurface` | Ink base + optional paper texture + border frame |
| `MoriCard` | Relic-style catalog card with shared radius, blur, shadow |
| `MoriFrame` | Ornamental section wrapper for hero and category tiles |
| `MoriCTA` | Framed shop/action button with consistent hover and focus |
| `MoriHeading` | Display/body typography pairing with ivory hierarchy |
| `MoriPetal` | Decorative or clickable petal with accessibility mode prop |
| `MoriPetalField` | Drift layer with exclusion zones and intensity control |
| `MoriTimeOfDayBackground` | Period-based background with reduced-motion fallback |
| `MoriCategoryTile` | Ornamental homepage navigation tile |

### Token usage

- Consume `tailwind.config.js` tokens only; do not add a parallel design-token system.
- Do not use deprecated `tailwind.config.ts` for new work.
- Share focus, hover, and border recipes across shop, blog, and homepage surfaces.

---

## Out-of-scope items

The following are explicitly **not** part of this document's implementation lane:

- Stripe, Printify, Clerk provider-write, or payment route changes
- Database schema, migrations, or env configuration
- `package.json`, lockfile, or dependency changes
- PR #31 security gate behavior
- PR #32 diagnostic harness behavior
- Avatar rendering (see `docs/design/avatar-visual-contract.md`)
- GameCube boot sequence implementation changes
- Enterprise readiness sweeps unrelated to visual contracts
- Modifying approved microcopy without explicit approval

---

## Recommended implementation sequence

1. `visual/mori-storybook-homepage` — homepage hero and category tiles
2. `feat/shared-mori-visual-primitives` — `MoriSurface`, `MoriCard`, `MoriPetal`, etc.
3. Apply primitives to shop and blog surfaces
4. `hardening/middleware-csp` — CSP alignment for decorative assets (deploy hardening lane)

---

## Files to inspect before implementation

- `tailwind.config.js` — active theme tokens
- `docs/design/homepage-design-system.md` — existing typography and color rules
- `docs/storyboards/homepage.md` — homepage layout and petal system storyboard
- `app/components/` — current homepage and layout components
- `.cursor/rules/theme-accessibility.mdc` — global dark glass theme standards
- `.cursor/rules/content-integrity.mdc` — protected microcopy
