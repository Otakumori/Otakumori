# Site Visual Contract

This is the stable visual-system contract for the current Otaku-mori implementation pass.

## Homepage

The homepage uses one living combined environmental world per time period. The user enters at the
sakura shoreline and scrolls downward through roots into the cavern/footer environment. UI is overlaid
semantically inside that world; the art controls geometry.

The homepage owns `#main-content` through `HomeSceneShell`. The shared non-home shell must not wrap
`/`, because that would add a competing visual surface around the authored combined world.

## Non-Home

Non-home routes use a shared dark Mori interior/interface background. They should not reuse the
homepage landscape as generic wallpaper, but they should share the same typography, color, border,
focus, and icon language.

Current implementation uses `SiteVisualShell` for non-home routes. It provides:

- `id="main-content"`
- `data-visual-surface="mori-interior"`
- `data-testid="mori-site-interior-shell"`
- a shared veil/content stack for route content

## Typography

Use one semantic type system across signed-out, signed-in, commerce, content, profile, game, admin,
loading, empty, error, and not-found states. Pages may vary density and hierarchy, but they should not
switch to a separate dashboard visual system after authentication.

## Icons

Icon treatment should remain thin, readable, ornamental where appropriate, and restrained. Normalize
stroke, sizing, framing, color, hover, and focus behavior before adding custom one-off icon styles.

## Petals

Homepage petals are art-native sakura blossoms and some are collectible. They remain connected to the
existing Petal system rather than a homepage-only wallet or balance. Reduced motion must preserve
collection.

## Auth

Authentication changes account-specific content and controls only. It must not change the homepage
world, scene geometry, time bucket, footer environment, Petal field, or overall visual system.

Local visual QA may use `OTM_VISUAL_QA_AUTH=1` as a process-scoped harness. That mode is disabled in
production and Vercel builds, avoids real Clerk credentials, and exists only to verify visual shell
continuity when the local browser cannot safely use a real authenticated session.

## Page States

Normal, loading, empty, error, auth, denied, 404, and service-unavailable states inherit the visual
shell of their route context. No state should fall back to a white browser page, default serif layout,
or unrelated component-library theme.
