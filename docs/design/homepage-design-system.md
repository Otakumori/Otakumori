# Homepage Design System Notes

## Goal

The Otaku-mori homepage should feel like a cohesive Sakura grove, not a collage of anime, game, shop, and account widgets. Visual polish is a product requirement. Typography, spacing, color, motion, and collection feedback should be treated with the same seriousness as performance, memory safety, collection integrity, and data safety.

## Current Theme Direction

The active Tailwind config is `tailwind.config.js`. It defines Sakura/glass/color token groups such as:

- `sakura.*`
- `glass.*`
- `primary.*`
- `accent.*`
- `text.*`
- `bg.*`
- `border.*`

The global CSS already exposes practical typography utilities:

- `font-display`
- `font-body`
- `font-ui`
- `font-princeps`
- `font-princeps-bold`
- `font-runic`

Use `font-display`, `font-body`, and `font-ui` for ordinary homepage UI. Reserve decorative fonts such as Princeps or Runic for rare brand/accent moments, not paragraphs, card descriptions, forms, or route labels.

There is also a deprecated `tailwind.config.ts` that should not be used for new design work.

## Homepage Typography Rules

Use typography intentionally:

- Hero display copy: `font-display` or the current hero-established display class.
- Body copy and section descriptions: `font-body` or inherited body font.
- Small labels/eyebrows and CTA labels: `font-ui`, uppercase when appropriate, tracked, restrained, and low-opacity.
- Avoid mixing multiple novelty fonts in the same viewport.
- Do not use game-style/pixel/medieval fonts for normal body text.

The homepage should read as premium and soft first, game-aware second.

## Color Rules

Use Sakura and glass tokens before hard-coded one-off colors when possible.

Preferred visual language:

- deep ink base
- soft Sakura pink highlights
- violet glow only as atmosphere
- translucent glass cards
- thin low-opacity borders
- readable white/off-white text

Avoid:

- neon-heavy gradients everywhere
- clashing pink/purple values per component
- low-contrast body copy
- saturated CTA stacks competing with the tree art

## Layout and Spacing Rules

The homepage skeleton should feel spacious and calm.

- Keep max-width constrained for reading comfort.
- Use generous vertical rhythm between hero, sections, and footer.
- Cards should be similar in radius, border opacity, blur, and shadow.
- CTAs should share shape, focus rings, and hover behavior.
- Do not put collectible petals over nav, CTAs, forms, or route cards.

## Motion Rules

Motion should feel like weather, not like a particle benchmark.

Allowed on homepage:

- CSS transform/opacity drift
- small burst feedback on collection
- subtle hover lift
- reduced-motion static or near-static state

Avoid on homepage:

- route-global game loops
- WebGL scene setup
- physics engines
- unbounded particle creation
- animation libraries for effects CSS can handle

## Petal Collection Aesthetic

The collection interaction should feel tactile and soft.

Recommended feedback sequence:

1. Petal has a comfortable pointer/touch target.
2. On pointer down/up, it gives immediate local feedback.
3. A small Sakura burst or shimmer appears.
4. The Petal Pouch summary pulses gently.
5. Server reconciliation quietly confirms or rolls back.

Use the user-facing term `Petal Pouch` unless a future product decision selects another name.

## Implementation Standard

New homepage UI should:

- use existing Tailwind theme classes and CSS variables where possible
- use `font-display`, `font-body`, and `font-ui` consistently
- avoid adding another design-token system
- avoid importing heavy animation/game libraries
- keep decorative effects capped and cleaned up
- preserve accessibility focus states
- maintain WCAG-readable contrast
- keep UI/UX consistency equivalent in priority to data and collection safety

## Follow-Up Cleanup

A future theme cleanup PR should verify whether Tailwind font-family tokens like `font-medieval`, `font-anime`, `font-display`, and `font-body` are actually backed by global CSS variables or overridden by global utility classes. If any token is missing or misleading, define it once in the global theme layer instead of patching individual components.
