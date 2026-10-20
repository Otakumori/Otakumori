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
  exact source.
- A dedicated portrait/mobile combined master is absent. Portrait currently uses the documented crop
  from approved wide art and therefore remains `ASSET WORK`, not a CSS illustration opportunity.
- Home visual closure requires owner review of local-time states, portrait crops, navbar treatment,
  Petal continuity, Soapstone treatment, and rooted footer composition.

## Production Asset Registry delta

| ID                                        | Family              | Surface       | Purpose                                                | Current state | Required state                                                  | Desktop / mobile                       | Safe zone                                                                                                                | Dependencies                                                                             | Owner approval required      |
| ----------------------------------------- | ------------------- | ------------- | ------------------------------------------------------ | ------------- | --------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------- |
| `home.world.night.wide-v1`                | Home world          | Home          | Authored nocturnal Surface → roots → Underground state | `INTEGRATED`  | `QA_PASSED`                                                     | Desktop/tablet wide; cropped on phones | Hero controls remain right/center clear; tree, moon, castle, root threshold, and footer path remain legible              | Existing combined-world projection and decode gate                                       | Yes — rendered Night state   |
| `home.world.early-morning.portrait-v1`    | Home world portrait | Home          | Phone-safe early-morning composition                   | `MISSING`     | `OWNER_APPROVED` → `RUNTIME_READY` → `INTEGRATED` → `QA_PASSED` | Mobile portrait                        | 390×844: tree canopy/trunk frame left/top, horizon visible, controls clear, root transition and footer path unobstructed | Approved wide early-morning identity                                                     | Yes                          |
| `home.world.morning.portrait-v1`          | Home world portrait | Home          | Phone-safe morning composition                         | `MISSING`     | `OWNER_APPROVED` → `RUNTIME_READY` → `INTEGRATED` → `QA_PASSED` | Mobile portrait                        | Same 390×844 world/controls/footer safe-zone contract                                                                    | Approved wide morning identity                                                           | Yes                          |
| `home.world.afternoon.portrait-v1`        | Home world portrait | Home          | Phone-safe afternoon composition                       | `MISSING`     | `OWNER_APPROVED` → `RUNTIME_READY` → `INTEGRATED` → `QA_PASSED` | Mobile portrait                        | Same 390×844 world/controls/footer safe-zone contract                                                                    | Approved wide afternoon identity                                                         | Yes                          |
| `home.world.late-afternoon.portrait-v1`   | Home world portrait | Home          | Phone-safe late-afternoon composition                  | `MISSING`     | `OWNER_APPROVED` → `RUNTIME_READY` → `INTEGRATED` → `QA_PASSED` | Mobile portrait                        | Same 390×844 world/controls/footer safe-zone contract                                                                    | Approved wide late-afternoon identity                                                    | Yes                          |
| `home.world.night.portrait-v1`            | Home world portrait | Home          | Phone-safe authored Night composition                  | `MISSING`     | `OWNER_APPROVED` → `RUNTIME_READY` → `INTEGRATED` → `QA_PASSED` | Mobile portrait                        | Preserve moonlit horizon, nocturnal light sources, tree/castle silhouettes, controls, root threshold, and footer path    | `home.world.night.wide-v1` identity                                                      | Yes                          |
| `home.world.special-twilight.portrait-v1` | Home world portrait | Home          | Phone-safe special-twilight composition                | `MISSING`     | `OWNER_APPROVED` → `RUNTIME_READY` → `INTEGRATED` → `QA_PASSED` | Mobile portrait                        | Preserve twilight horizon, castle/tree hierarchy, controls, root threshold, and footer path                              | Approved wide special-twilight identity                                                  | Yes                          |
| `home.ui.petal-wallet-satchel.nav-v1`     | Petal economy UI    | Navbar        | Readable Petal Wallet silhouette at navigation scale   | `INTEGRATED`  | `QA_PASSED`                                                     | Desktop/mobile navigation              | 36×36 source slot inside ≥44px semantic target; blossom/satchel silhouette must survive at 1×                            | Approved `petal-wallet-satchel.webp` derivative and existing wallet route/ARIA authority | Yes — scale/readability      |
| `home.ui.soapstone-plaque.embedded-v1`    | Soapstone UI        | Rooted footer | Found-artifact entry to the semantic Soapstone dialog  | `INTEGRATED`  | `QA_PASSED`                                                     | Desktop/mobile                         | Accessible HTML inscription remains legible; plaque stays clear of world focal paths                                     | Approved `soapstone-plaque-embedded.webp`; existing dialog/focus contract                | Yes — material/rune response |

## Phase result

`HOME VISUAL CLOSURE BLOCKED — ASSET PRODUCTION REQUIRED`

The technical gate remains closed by focused logic/browser evidence. The missing portrait family is
launch-blocking production asset work, and the refined Home presentation remains subject to owner
review. No visual approval is implied by this status.
