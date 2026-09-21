# Visual reconciliation — 2026-09-21

## Authority outcome

- Batch 2 remains the sole authority for its 39 approved assets. `public/` placement and visual quality do not imply approval.
- Mori feature art remains `production-candidate-requires-in-context-owner-QA`; no candidate was promoted by this reconciliation.
- Home world masters, scene geometry, six time states, petals, accessibility behavior, and the Soapstone semantic flow remain protected canon.

## Resolved contradictions

| Surface | Before | Reconciled state |
| --- | --- | --- |
| Avatar helper | 10 of 19 approved avatar assets were exposed | All approved presentation, category, and action paths are exposed; no editor behavior changed. |
| Maid Café Manager | Route and approved art existed, active catalog omitted it | Existing route is cataloged with approved cover/hub art. |
| Bubble / Thigh identity | Legacy slugs appeared as canon | Bubble Ragdoll uses its normalized presentation identity while retaining `bubble-girl`. Thigh Colosseum is the canonical display/product identity; `thigh-coliseum` remains the current age-gated runtime/compatibility slug. |
| Navbar controls | Large feature art appeared at 30px | Wishlist, Community, and Cart use accessible semantic vectors; feature art remains feature-sized only. |
| Home UI delivery | PNG copies were source-like and runtime-delivered | Protected source masters remain in docs; active UI paths use WebP derivatives. |

## Runtime derivative audit

All WebP files retain alpha. Quality: WebP 92, Lanczos3 resize. “QA” is static metadata and source/reference verification; browser rendering remains required before visual certification.

| Old runtime copy | New derivative | Old → new bytes | Reduction | Dimensions | QA |
| --- | --- | ---: | ---: | --- | --- |
| `arrow-forward.png` | `runtime/arrow-forward.webp` | 2,084,795 → 12,216 | 99.4% | 1536×1024 → 256×171 | alpha/composition verified |
| `blog-journal.png` | `runtime/blog-journal.webp` | 2,143,551 → 24,032 | 98.9% | 1254×1254 → 256×256 | alpha/composition verified |
| `cart-japanese-merchant.png` | `runtime/cart-japanese-merchant.webp` | 2,430,616 → 38,344 | 98.4% | 1254×1254 → 256×256 | alpha/composition verified |
| `cursor-body-helper.png` | `runtime/cursor-body-helper.webp` | 1,573,985 → 8,606 | 99.5% | 1536×1024 → 256×171 | alpha/composition verified |
| `cursor-tassel-helper.png` | `runtime/cursor-tassel-helper.webp` | 171,770 → 5,900 | 96.6% | 480×554 → 128×148 | alpha/composition verified |
| `messages-sealed-letter.png` | `runtime/messages-sealed-letter.webp` | 1,891,312 → 20,034 | 98.9% | 1254×1254 → 256×256 | alpha/composition verified |
| `petal-wallet-satchel.png` | `runtime/petal-wallet-satchel.webp` | 1,798,659 → 18,896 | 98.9% | 1254×1254 → 256×256 | alpha/composition verified |
| `profile-avatar-frame.png` | `runtime/profile-avatar-frame.webp` | 1,526,502 → 23,978 | 98.4% | 1254×1254 → 256×256 | alpha/composition verified |
| `search-magnifier.png` | `runtime/search-magnifier.webp` | 1,198,624 → 21,570 | 98.2% | 1254×1254 → 256×256 | alpha/composition verified |
| `soapstone-plaque-embedded.png` | `runtime/soapstone-plaque-embedded.webp` | 1,193,311 → 169,550 | 85.8% | 1254×1254 → 1024×1024 | alpha/composition verified |
| `wishlist-heart-charm.png` | `runtime/wishlist-heart-charm.webp` | 1,620,467 → 20,530 | 98.7% | 1254×1254 → 256×256 | alpha/composition verified |

`cursor-combined-source.png` was an unreferenced public duplicate. It was removed with the retired runtime PNGs; the locked cursor master remains under `docs/design/references/home-ui-implementation-v1/source-masters/`.

## Runtime-route terminology

- **Thigh Colosseum** is the canonical display/product identity.
- `/mini-games/thigh-coliseum` is the existing functional, age-gated runtime/compatibility route and remains unchanged.
- `/mini-games/thigh-colosseum` is not a functional route. It is a future routing-convergence consideration only; this checkpoint introduces no routing move or redirect.

## Validation exceptions

- `pnpm assets:verify` is a **pre-existing repository validator/ESM entrypoint defect**: the module-mode `npx tsx scripts/assets-verify.ts` invocation reaches `if (require.main === module)` before validation begins.
- `pnpm assets:validate` is the same **pre-existing repository validator/ESM entrypoint defect** in `scripts/validators/assets-validate.ts`; it fails before validation begins.
- `pnpm assets:check` reports the pre-existing OG/banner asset backlog, unrelated to this reconciliation.
- `pnpm icons:validate` is report-only at this point: it exits 0 while identifying legacy missing game icon assets.
- Final validation used Node `v24.19.0`. These exceptions are not reconciliation failures and are not repaired in this visual checkpoint.

## Route visual-readiness

| Rating | Surface | Evidence |
| --- | --- | --- |
| A | Home | Protected canonical scene and optimized existing UI assets. Cursor tassel remains a reviewable existing implementation. |
| B | Avatar editor | Functional but generic pink/purple UI with mock options; no production avatar-content claim. |
| C | Empty states and destinations | Approved art exists; messages, collection, admin, achievements, trade, and music need owned-surface integration. |
| C | `/mini-games` catalog | Approved cover/hub art is wired for five governed games; gameplay readiness is separate. |
| D | Mori feature and Sakura crest family | Existing candidates require owner acceptance in their intended surface. |
| E | Small Mori glyphs and real avatar/gameplay content | No approved or suitable candidate system exists. |
| F | Puzzle Reveal future canon | Canvas/WebGL/mask architecture and authored layers are required; this is not a cover-art gap. |
| G | `/games` | Legacy iframe surface; retain as compatibility pending a separate convergence decision. |

## Better implementation choices

- Use semantic vectors for close, back, menu, search, share, cart counts, and status states; do not commission large raster art for 16–32px controls.
- Build Puzzle Reveal as a render system (Canvas/WebGL, reveal masks, lacquer/ash textures, fracture FX, and authored substrate), not as a new GlassCard skin.
- Keep first-petal as an owner scale/semantics decision among existing non-tassel crest candidates before adding an art request.
- Keep avatar outfit references as design authority only. A real avatar needs the documented GLB, rig, morph, material, LOD, attachment, and clipping contract.

## Owner decisions

1. Select or reject a non-tassel Sakura crest after in-context first-petal QA; that determines whether a new reward token is justified.
2. Accept or reject each Mori feature candidate in its owned surface. Do not batch-promote the family.
3. Retain or remove the existing Home cursor tassel after desktop pointer QA; it is not precedent for additional tassels.

## Next bounded implementation

**Avatar editor presentation-only integration.** Use the now-complete approved helper to add stage/backplate and category/action art at card-scale, retaining real labels, focus behavior, mobile targets, current state logic, and the existing mock-content boundary. This has high visual benefit and low infrastructure risk; it does not attempt the separate avatar-content or 3D-runtime program.

## Stack convergence recommendation

Analysis only: retain the stacked branches unchanged. Before any convergence, recheck live PR state, the current `main` merge base, three-dot diffs, and CI on each dependency. Do not rebase, retarget, or merge as part of visual reconciliation.
