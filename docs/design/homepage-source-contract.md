# Homepage Source Contract

This document records the current source authority for the Mori homepage implementation. Runtime
code and QA conform to these assets; the approved source art is not distorted to satisfy legacy
layout assumptions.

## Approved Visual Authority

Canonical approved wide master directory:

`docs/design/references/home-world-wide-approved/`

Canonical approved files:

| Period | Approved master | Measured dimensions |
| --- | --- | ---: |
| Early morning | `om-home-world-01-early-morning-wide.png` | 1325 x 1187 |
| Morning | `om-home-world-02-morning-wide.png` | 1325 x 1187 |
| Afternoon | `om-home-world-03-afternoon-wide.png` | 1325 x 1187 |
| Late afternoon | `om-home-world-04-late-afternoon-wide.png` | 1325 x 1187 |
| Night | `om-home-world-05-night-wide.png` | 1325 x 1187 |
| Special twilight | `om-home-world-06-special-twilight-wide.png` | 1325 x 1187 |

All six approved masters share the same pixel dimensions and aspect ratio. They are treated as the
same authored location with different lighting/time states.

## Runtime Derivatives

Browser-facing runtime copies live under:

`public/assets/home/world/combined/`

The runtime filenames match the approved master filenames. These files are runtime derivatives of
the approved design masters; they do not outrank the source directory.

The current runtime ships PNG derivatives only. No AVIF/WebP derivative is generated in this pass,
so there is no lossy optimization comparison to certify yet.

## Combined World Model

Each homepage period maps to one precomposed environmental world containing:

- surface shoreline
- sakura tree and visible roots
- ground cross-section
- underground root network
- cavern/footer environment

Separate runtime surface/root/footer image alignment is superseded. The homepage must not reconstruct
the seam from separate paintings, independently transform the underground, or use split-image seam
tie points as a shipping contract.

## Runtime Contract

`app/components/hero/homeScene.ts` is the typed runtime manifest. It must preserve:

- one combined image per `HomeSceneBucket`
- stable 1325 x 1187 artboard geometry
- browser-local time-of-day bucket selection
- special twilight behavior
- one scrollable world projection with preserved aspect ratio
- footer content overlaid inside the authored underground/cavern region
- no axis-independent stretching

The live homepage shell exposes:

- `data-home-scene-shell`
- `data-testid="mori-home-scene-shell"`
- `data-scene-projection-contract="combined-world-master"`
- `data-testid="mori-root-footer"`
- `data-root-footer-contract="combined-world-overlay"`

## Petals

The Petal atlas remains a separate interactive runtime asset:

`public/assets/images/petal_sprite.png` (874 x 668, 4 x 3 frames)

Petals are not painted into the combined masters because they remain ambient and collectible UI.
Decorative petals stay non-interactive and hidden from assistive technology. Collectible petals remain
semantic controls with pointer, touch, keyboard, focus, reduced-motion, and persistence support.

## Portrait Status

No dedicated approved portrait/mobile combined master exists in this repository. Portrait behavior is
a deliberate crop into the approved wide combined masters. Dedicated portrait art remains the correct
future improvement if the current crop cannot preserve enough tree, root, cavern, and footer context.

## Auth Continuity Contract

The `/` homepage renders one Mori world. Authentication may change account controls and persisted
state, but it must not switch to another homepage implementation or redirect local/Preview sessions
to Production.

Local and Vercel Preview hosts must enter same-origin `/sign-in` and `/sign-up` shims so return URLs
are derived from the active request origin. Production hosts may use the hosted Account Portal.
