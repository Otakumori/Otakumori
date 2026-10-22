# Home Flagship Closure

Baseline: Admin Operations Closure v1 (`6620e9cc4f12ae54c63c57da6dc1cbf79b532c5c`).

## Authority

- Approved wide environmental masters remain authoritative under
  `docs/design/references/home-world-wide-approved/`.
- `app/components/hero/homeScene.ts` owns local-time scene selection and projection math.
- `HomeSceneProvider` owns browser-local resolution, boundary refresh, sleep/wake recovery, reduced
  motion, and viewport projection.
- Navbar, collectible Petals, search, Soapstone, and rooted footer interactions retain their existing
  owners.

## Technical closure

- The server no longer presents the synthetic noon scene as environmental truth. It reserves stable
  charcoal geometry until browser-local time resolves.
- Scene refresh aligns to local minute boundaries and resynchronizes after visibility/page-cache
  restoration.
- CSS reserves the same world height and footer anchor produced by the runtime projection before
  ResizeObserver runs, removing the known first-projection layout shift.
- The active world remains behind a charcoal shell until the selected optimized image has loaded and
  decoded. Foreground presentation is withheld until that contract resolves, so overlays no longer
  claim a world that is not ready.
- Approved current and next scene assets use responsive Next image candidates capped to the authored
  1200px desktop slot instead of preloading multi-megabyte source PNGs. Time-boundary crossfades wait
  for the incoming image to decode while retaining the current scene.
- Primary image failure tries the approved adjacent-scene fallback. If both assets fail, Home exposes
  an authored charcoal/bronze/sakura substrate rather than a broken image or empty viewport.
- Reduced-motion behavior retains static environmental layers and bounded Petal density.

## Quality gates

Required evidence for this phase:

- deterministic local-time and boundary tests;
- Home-focused browser flow at 390x844, 768x1024, and approximately 1280x900;
- reduced-motion and resize/orientation proof;
- Lighthouse performance >= 0.90 and CLS <= 0.10;
- scoped lint, TypeScript classification, and diff check.

## Asset and owner gates

- Wide masters are approved and present.
- The Night bucket resolves to the genuinely authored
  `public/assets/home/world/combined/om-home-world-05-night-wide.png` master. It is a distinct
  moonlit environment, not a CSS tint; deterministic browser evidence must continue to prove that
  exact source. The owner replacement requested for this final correction pass was not present in
  the authorized local search locations, so the canonical source/runtime pair was not overwritten.
- A dedicated portrait/mobile combined master is absent. Portrait currently uses the documented crop
  from approved wide art and therefore remains `ASSET WORK`, not a CSS illustration opportunity.
- Home visual closure requires owner review of local-time states, portrait crops, navbar treatment,
  Petal continuity, Soapstone treatment, and rooted footer composition.

## Production Asset Registry delta

| ID | Family / surface | Purpose | Source path | Runtime path | Current state | Required state | Placeholder | Safe zone / dependencies | Owner approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `home.world.night.wide-v1` | Home world / Home | Authored nocturnal Surface → roots → Underground state | `docs/design/references/home-world-wide-approved/om-home-world-05-night-wide.png` | `public/assets/home/world/combined/om-home-world-05-night-wide.png` | `INTEGRATED`; requested owner replacement not found locally | `QA_PASSED` after exact-source visual review | No | Desktop/tablet wide; hero controls, tree, moon, castle, root threshold, and footer path remain legible; depends on existing decode gate | Required |
| `home.world.late-afternoon.portrait-v1` | Home world portrait / Home | First portrait geometry slice preserving the approved late-afternoon Surface → roots → Underground world | `docs/design/references/home-world-portrait-candidates/om-home-world-04-late-afternoon-portrait.png` | `MISSING` | `CANDIDATE`; 853×1844 PNG; SHA-256 `0A1632EB872DC9B97797A923852A8961811BF5BC9B0D54D7B024DA0E8E035014` | `OWNER_APPROVED` → `RUNTIME_READY` → `INTEGRATED` → `QA_PASSED` | No | 390×844 primary safe zone with 360×800, 412×915, and 430×932 review envelope; derived by controlled recomposition from the approved late-afternoon combined wide master | Required — approve, revise, or reject geometry |
| `home.world.<remaining-time-state>.portrait-v1` | Home world portrait / Home | Remaining five phone-authored time states after geometry approval | `MISSING` | `MISSING` | `MISSING` | `OWNER_APPROVED` → `RUNTIME_READY` → `INTEGRATED` → `QA_PASSED` | No | Must reuse the approved late-afternoon portrait geometry rather than create unrelated compositions | Required |
| `ui.petal-wallet.blossom-nav-v1` | Petal economy UI / Navbar | Readable blossom economy mark at navigation scale | `docs/design/references/home-ui-acceptance/runtime-candidates/sakura_petal_wallet_emblem.png` | `public/assets/home/ui/sakura-petal-wallet-emblem.webp` | `INTEGRATED` | `QA_PASSED` | No | 28px perceived mass inside the existing semantic control; depends on existing wallet route and ARIA authority | Required |
| `ui.petal-wallet.satchel-v1` | Petal economy UI / Wallet surfaces | Rich opened-wallet/satchel artifact | Existing approved Home UI source | `public/assets/home/ui/runtime/petal-wallet-satchel.webp` | `RUNTIME_READY`; no longer used as the compact nav mark | `INTEGRATED` where an opened-wallet surface requires it | No | Preserve detail at larger artifact scale; depends on Petal Economy UI context | Required before new integration |
| `ui.soapstone.resting-v1` | Soapstone UI / Rooted footer | Rune-only resting artifact leading to a separate readable dialog | Existing approved Home UI source | `public/assets/home/ui/runtime/soapstone-plaque-embedded.webp` | `INTEGRATED` | `QA_PASSED` | No | Resting plaque carries no plain-language face label; semantic button name, focus, dialog, and route remain HTML-owned | Required |

## Phase result

`HOME VISUAL CLOSURE BLOCKED — ASSET PRODUCTION REQUIRED`

The technical gate remains closed by focused logic/browser evidence. The missing portrait family is
launch-blocking production asset work, and the refined Home presentation remains subject to owner
review. No visual approval is implied by this status.
