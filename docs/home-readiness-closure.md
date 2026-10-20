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
- A dedicated portrait/mobile combined master is absent. Portrait currently uses the documented crop
  from approved wide art and therefore remains `ASSET WORK`, not a CSS illustration opportunity.
- Home visual closure requires owner review of local-time states, portrait crops, navbar treatment,
  Petal continuity, Soapstone treatment, and rooted footer composition.

## Phase result

`HOME TECHNICALLY READY — OWNER VISUAL REVIEW REQUIRED`

The technical gate is closed by focused logic/browser evidence. The missing portrait master remains
asset work, and no visual approval is implied by this status.
