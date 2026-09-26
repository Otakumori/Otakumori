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
| Muted Sakura | Life, selection, reward | Sparse signal only |
| Ash | Threshold and aftermath | Games or special environmental contexts |
| Ink and memory light | Record and rare exceptional state | Never ordinary glow |

Each local composition should normally combine one dominant material, one supporting material, and
one accent. It should not use glass blur, large rounded SaaS cards, or a complete motif catalogue.

## Token architecture

`app/styles/mori-foundation.css` is an incremental layer, loaded after legacy global CSS.

- Primitive tokens begin with `--mori-color-`, `--mori-space-`, `--mori-radius-`,
  `--mori-duration-`, and `--mori-ease-`.
- Semantic tokens express material, text, edge, accent, state, and safe-area intent.
- World Echo variables are hooks only in this phase. Future route work may set lightweight ambient
  values; it must not load Home backgrounds, change interaction meaning, or alter layout.

Existing `--om-*` and legacy theme variables remain in place. Migration is opt-in and incremental.

## Canonical primitives

`app/components/mori/MoriFoundation.tsx` supplies a small vocabulary:

- `MoriSurface` for a semantic material surface
- `MoriFrame` for interrupted bronze object framing
- `MoriSectionHeader` for hierarchy and recorded context
- `MoriDivider` for a quiet continuity marker
- `MoriButton` for native-button states
- `MoriStatus` for a color-independent status marker

Existing `StorefrontPrimitives` is adapted to use `MoriSectionHeader` and `MoriSurface`; it remains
the compatibility entry point for current Shop and Home callers. `SiteVisualShell` remains the one
non-Home route shell and now exposes `data-mori-route-shell="interior"` for the foundation layer.

## Interaction and accessibility contract

Every control has resting, hover, focus, pressed, selected, loading, disabled, success, and error
design intent. Native semantics remain primary. Focus uses the authored bronze/ivory edge treatment;
selected and status states include shape or text rather than color alone. Reduced motion removes
nonessential transformation while preserving state feedback.

The semantic layer targets a 44px minimum control height and an inline safe area token. Route
implementations must protect text-safe zones rather than placing text over arbitrary art.

## Motion and performance contract

The foundation uses CSS only—no Canvas, WebGL, continuous animation loop, raster asset, or new
dependency. Motion is limited to response and settle durations; it is interruptible and disabled for
reduced-motion users. Future work should use reveal, trace, and transform motion only when a
meaningful state transition warrants it.

## Responsive contract

Future adopters validate at 320px, 390x844, 768x1024, and 1280x900 or larger. Preserve primary
function, focal element, hierarchy, then identity—ornament is the first thing to simplify.

## Deferred work

The Material & Motif Lab is deliberately deferred. The repository has a legacy public test visual
route, and introducing another destination before its access boundary is formalized would add
unnecessary surface area. A future internal-only lab must be Preview/development-only, unindexed,
accessible, dependency-free, and use these real primitives rather than mock copies.
