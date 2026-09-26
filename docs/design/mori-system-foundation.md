# Mori System Foundation

## Purpose and scope

This document defines the reusable visual foundation for future Otaku-mori route work. It does not
redesign routes or replace approved world, destination, Avatar, or game artwork. Home remains the
sole owner of its six-state environmental world.

The shared system follows one rule: **mystery belongs to the world; clarity belongs to the interface.**

## Materials

| Material | Meaning | Intended use |
| --- | --- | --- |
| Charcoal paper | Quiet Mori interior | Ordinary route substrate |
| Black lacquer | Permanence and intentional presentation | High-value control regions and relics |
| Parchment | Recorded human information | Archive content and documentation-like information |
| Antique bronze | Craft, structure, preservation | Hairline frames, dividers, and focus-adjacent structure |
| Sakura pigment / ink | Botanical line, selected indicator, restrained print or stamp | Sparse signal only |
| Sakura silk material | Rare authored textile-like presentation | Personal, reward, or deliberately framed use only |
| Ash | Threshold and aftermath | Games or special environmental contexts |
| Ink and memory light | Record and rare exceptional state | Never ordinary glow |

Each local composition should normally combine one dominant material, one supporting material, and
one accent. It should not use glass blur, large rounded SaaS cards, or a complete motif catalogue.

## Token architecture

`app/styles/mori-foundation.css` is an incremental layer, loaded after legacy global CSS.

- Primitive tokens begin with `--mori-color-`, `--mori-space-`, `--mori-radius-`,
  `--mori-duration-`, and `--mori-ease-`.
- Semantic tokens express material, text, edge, accent, state, and safe-area intent.
- `--mori-pigment-sakura` is an ink role for small printed or selected signals. It is distinct from
  `--mori-material-sakura-silk`, a rare authored material token that ordinary controls must not use.
- Fine structural, catalogue, and ink line roles support CSS/SVG-friendly printed construction without
  supplying route art. The grain hook is opt-in, static, and deliberately low contrast.
- World Echo variables are hooks only in this phase. Future route work may set lightweight ambient
  values; it must not load Home backgrounds, change interaction meaning, or alter layout.

Existing `--om-*` and legacy theme variables remain in place. Migration is opt-in and incremental.

## Canonical primitives

`app/components/mori/MoriFoundation.tsx` supplies a small vocabulary:

- `MoriSurface` for a material surface, with a neutral `div` default and explicit `as` only when
  document semantics are intended
- `MoriFrame` for interrupted bronze object framing
- `MoriSectionHeader` for hierarchy and recorded context
- `MoriDivider` for a quiet continuity marker
- `MoriButton` for native-button states
- `MoriStatus` for a color-independent status marker

Existing `StorefrontPrimitives` is adapted to use `MoriSectionHeader` and `MoriSurface`; it remains
the compatibility entry point for current Shop and Home callers. `SiteVisualShell` remains the one
non-Home route shell and now exposes `data-mori-route-shell="interior"` for the foundation layer.
Its responsibility is a neutral Mori substrate only; route shells own their own warmth, parchment,
ash, lacquer, or other environmental identity.

## Containment grammar

Material describes what a surface is. Containment describes how strongly it is framed. They are
separate decisions:

1. **Environmental placement** — no box is required; spacing and the shared substrate carry the
   relationship.
2. **Material surface** — a material shift may be sufficient, without a border, radius, or shadow.
3. **Framed object / relic** — use deliberate structural linework or the interrupted `MoriFrame`.
4. **Functional control region** — use `quiet` or `raised` containment only as strongly as usability
   requires.

Containment communicates function, material, and importance. Prefer spacing, typography, linework,
or material shift before another box. Important content may be framed by implication; avoid
rectangle-inside-rectangle composition. Mobile may simplify framing while preserving hierarchy.

## Interaction and accessibility contract

Every control has resting, hover, focus, pressed, selected, loading, disabled, success, and error
design intent. Native semantics remain primary. Focus uses the authored bronze/ivory edge treatment;
selected and status states include shape or text rather than color alone. Reduced motion removes
nonessential transformation while preserving state feedback.

The semantic layer targets a 44px minimum control height and an inline safe area token. Route
implementations must protect text-safe zones rather than placing text over arbitrary art.

`MoriDivider` is decorative and hidden from assistive technology without a label. With a visible
label it exposes an intentional named separator. `MoriSurface` does not create a landmark unless a
caller explicitly chooses a semantic element.

## Motion and performance contract

The foundation uses CSS only—no Canvas, WebGL, continuous animation loop, raster asset, or new
dependency. Motion is limited to response and settle durations; it is interruptible and disabled for
reduced-motion users. Future work should use reveal, trace, and transform motion only when a
meaningful state transition warrants it.

## Responsive contract

Future adopters validate at 320px, 390x844, 768x1024, and 1280x900 or larger. Preserve primary
function, focal element, hierarchy, then identity—ornament is the first thing to simplify.

## Screenshot interpretation

Current `/shop` screenshots validate only the foundation boundary: neutral global continuity,
containment flexibility, focus, and responsive behavior. They are not approved Shop art direction.
The large rounded loading/product placeholders are legacy route behavior, the current Shop hero is
not a merchant-archive composition, and empty areas are not approved composition. Future route work
must not treat the absence of botanical or relic imagery here as authority.

## Typography authority

`MoriSectionHeader` uses the existing `--font-display`; body copy and controls use the existing
`--font-body` and `--font-ui`. Those variables resolve in `app/globals.css` to the current
Roboto Condensed/Cinzel fallback stack. The only duplicate local-font export is limited to the
mini-games layout and does not override this foundation. No font changed in this pass; typography
art direction remains a separately bounded review.

## Deferred work

The Material & Motif Lab is deliberately deferred. The repository has a legacy public test visual
route, and introducing another destination before its access boundary is formalized would add
unnecessary surface area. A future internal-only lab must be Preview/development-only, unindexed,
accessible, dependency-free, and use these real primitives rather than mock copies.
