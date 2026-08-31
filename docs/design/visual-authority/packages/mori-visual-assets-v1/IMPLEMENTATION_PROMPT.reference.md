OTAKU-MORI CODEX CHECKPOINT
MORI VISUAL ASSET AUTHORITY + SAFE SITE INTEGRATION

Repository:
Otakumori/Otakumori

Attachment:
otakumori-mori-visual-assets-v1.zip

PURPOSE

Integrate the new reference-grounded Mori visual package without flattening the project into one art style or forcing every supplied image into a UI slot.

The package separates:
- user-approved references
- generated source masters
- optimized runtime feature art
- avatar outfit reference art
- explicit missing assets

Do not treat those categories as interchangeable.

1. PREFLIGHT / STACK

Expected current parent:

PR #84
title: feat: bring the Memory Keeper into the Reliquary
branch: codex/memory-keeper-reactive-presentation
expected head:
36a49993e7d8a1dfa361f7f631b3646e3041c6c9

At prompt creation PR #84 was open, Draft and unmerged.

VERIFY live GitHub state again before editing.

Do not modify PR #84 directly.

Create an isolated stacked branch:

codex/mori-visual-asset-integration

Base:
codex/memory-keeper-reactive-presentation

Suggested worktree:
C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori-mori-visual-asset-integration

Record worktree, branch, starting HEAD, PR #84 current head/base/state and dirty state.

STOP for unexplained dirt or unexpected stack movement.

2. PACKAGE INTAKE

Before copying, inspect:

README-CODEX.md
docs/design/visual-authority/asset-manifest.json
docs/design/visual-authority/missing-assets.json
docs/design/visual-authority/avatar-outfit-brief.md

Then inspect:
docs/design/references/site-visual-authority/approved-user-references/

These are visual authority.

Copy the CONTENTS of the ZIP to the repository root.
Do not nest the ZIP wrapper.

Reconcile existing paths instead of blindly overwriting.

3. VISUAL AUTHORITY

Default site language:
- charcoal / bark / near-black
- dusty sakura / muted blush
- warm cream
- restrained aged bronze
- delicate Japanese ornamental geometry
- anime/cel line character
- tactile stone, leather, cloth and metal
- Souls-like restraint without copying third-party assets
- no broad neon wash
- no generic SaaS glassmorphism

SMALL ICONS:
Follow `mori-site-iconography-reference.png`.

LARGE FEATURE ART:
Use runtime assets from `public/assets/ui/mori/feature/`.

A 512px illustrated shrine, stall, monument, journal or katana is NOT a finished 16–24px navigation glyph.

Do not downscale feature art into tiny navbar controls merely to remove Lucide icons.

4. CURRENT PACKAGE ASSETS

Use `asset-manifest.json` as source of truth.

High-confidence candidates:
- mori-avatar-frame-sakura.webp
- mori-soapstone-monument.webp
- mori-collection-journal.webp
- mori-quests-katana.webp
- mori-blog-scroll.webp
- mori-search-magnifier.webp
- mori-messages-envelope.webp
- mori-notifications-bell.webp
- mori-shop-market-stall.webp
- mori-apparel-kimono.webp
- mori-accessories-charm-wreath.webp
- mori-home-shrine.webp

Badge/crest candidates:
- mori-sakura-primary-medallion.webp
- mori-sakura-growth-crest.webp
- mori-sakura-tassel-seal.webp
- mori-sakura-diamond-crest.webp
- mori-sakura-bloom-crest.webp

Every candidate still requires in-context browser QA.

If an asset makes a surface worse, defer it and report why.

5. TARGET SURFACES

Profile/avatar:
- profile frame option/presentation
- badge/crest surfaces that already have legitimate semantics

Soapstone/community:
- use monument/panel art only if it improves the current generic modal while preserving accessible dialog behavior
- compare against `mori-soapstone-components-reference.png`

Shop:
- market stall as destination/header/empty-state art if it does not compete with merchandise
- kimono for Apparel category
- charm wreath for Accessories category

Collection / Quests / Blog:
- journal
- katana
- scroll

Search / Messages / Notifications:
- magnifier, envelope and bell as feature/empty-state art
- do NOT use them as tiny controls by default

Home:
- `mori-home-shrine.webp` is an internal destination motif only
- do NOT replace/repaint the canonical Home world

6. PR #84 IS ALREADY IMPLEMENTED

Memory Defrag's Keeper reactive presentation is already in PR #84.

Do not duplicate or broadly modify it.

No engine rewrite, deterministic-state changes, fake failure condition, reward/achievement authority change or duplicated Keeper asset import.

7. EXPLICIT SMALL-ICON GAP

Read:
docs/design/visual-authority/missing-assets.json

The approved reference covers many small icons, but this ZIP does not contain faithful isolated production glyphs for all of them.

For missing small icons:

A. Keep the current functional icon if no approved replacement exists.
B. Record exact remaining generic icon + file/surface.
C. Author a simple SVG only when you can faithfully reproduce the approved reference without reinterpretive drift.
D. Otherwise defer and write an exact asset brief.

Do not substitute rejected earlier icon experiments.
Do not mark an item complete because a large feature illustration exists.

8. AVATAR OUTFITS

Read:
docs/design/visual-authority/avatar-outfit-brief.md

The two Sakura Nightwarden PNGs are REFERENCE ONLY.

Never use them as a fake runtime avatar.

Preserve for future canonical 3D implementation:

Shared:
- dark tailored layers
- dusty rose/sakura
- restrained bronze
- fur/feather mantle
- cords/tassels/botanical hardware
- anime-realistic dark-fantasy silhouette

Feminine:
- preserve fitted bust/waist/hip silhouette and physical allure through actual mesh tailoring/body fit
- intentional thigh exposure via asymmetric skirt/cape openings
- rig-safe thigh/garter hardware
- tall armored footwear
- no painted fake anatomy
- no clipping at bust/waist/hips/thighs

Masculine:
- fitted high collar
- lean athletic silhouette
- mantle
- asymmetric long coat
- belts/chains/armor accents
- tall boots

Cross-hatching:
- material/shader/texture feature
- strongest on cloth/leather midtones/shadows
- avoid mobile moire
- keep skin cleaner
- preserve cel silhouette
- game-specific intensity may vary without forking saved avatar identity

Do not create another competing avatar renderer in this checkpoint.

Return exact dependencies needed to translate these outfits into the canonical skeletal GLB/glTF runtime.

9. ENTERPRISE ASSET PARAMETERS

Runtime assets are already self-hosted transparent WebP and bounded/compressed.

Requirements:
- no remote image dependencies
- no base64/data-URI duplication
- fixed width/height or aspect ratio
- no layout shift
- lazy loading by default
- async decode by default
- no global preload
- `priority` only for demonstrated above-the-fold critical art
- never preload avatar reference art
- preserve alpha
- no raster animation loops
- wrapper transform/opacity animation only
- pause optional motion offscreen
- honor prefers-reduced-motion
- no large JS animation package
- inspect transferred bytes in browser
- use `next/image` when it materially improves sizing/loading
- avoid filter-heavy effects around large transparent images

10. ACCESSIBILITY

Raster art is never the semantic label.

Interactive wrappers:
- accessible name on button/link
- keyboard focus remains obvious
- image cannot intercept pointer events unnecessarily

Decorative art:
- alt=""
- aria-hidden as appropriate
- pointer-events:none when layered

Test zoom/reflow.
No horizontal overflow caused by feature art.

11. SECURITY / SCOPE

No DB mutation/migration/seed/reset.
No provider mutation.
No Stripe/Printify/Merchize action.
No Vercel env mutation.
No Production deploy.
No env-file creation.
No secrets.
No permanent Petal grants.
No achievement writes.
No auth weakening.
No arbitrary external downloads.

Do not introduce third-party franchise logos/assets.

12. REPO HYGIENE

Before committing all source/reference PNGs, inspect existing `docs/design/references` conventions and repository-size impact.

Runtime WebP files actually used by the site are intended to be committed.

For source/reference PNGs:
- commit when consistent with established design-reference policy
- otherwise retain only minimum authority files needed
- report omitted source files
- do not add Git LFS unless already established
- do not duplicate identical images

Keep manifest and missing register accurate.

13. VISUAL QA

Capture baseline before changing each target surface.

Required viewport matrix:
390x844
430x932
768x1024
1024x768
1280x900
1440x900
1920x1080

Also:
- prefers-reduced-motion
- keyboard-only
- 200% zoom
- 400% reflow where practical

Check:
- alpha transparency / no black rectangles
- no clipping
- no fuzzy scaling
- no pointer interception
- no false affordances
- no excess ornament
- correct contrast
- no significant CLS
- no art competing with page content

For auth-gated surfaces use existing visual-QA/auth mechanisms only.

14. VALIDATION

Run appropriate focused tests plus:

pnpm type-check
pnpm lint
git diff --check
pnpm security:scan
pnpm docs:security:check

Attempt:
pnpm build

Use only established process-scoped safe placeholder env values if necessary.
Do not create env files.

Classify inherited repo-wide warnings separately.

15. IMPLEMENTATION ORDER

1. ingest authority docs/manifests
2. audit intended surfaces
3. integrate 1–2 highest-confidence assets
4. render/critique
5. continue only where result is demonstrably better
6. profile/avatar-frame integration if architecture fits
7. Soapstone integration
8. audit remaining small-icon gaps
9. update missing register
10. final responsive/accessibility/performance QA

Do not force every supplied image into the first PR.

16. COMMIT / PR

When validated:

Push:
codex/mori-visual-asset-integration

Open a Draft PR against:
codex/memory-keeper-reactive-presentation

Suggested title:
feat: establish Mori visual asset authority

Keep Draft.

No merge.
No Ready transition.
No Production deploy.

17. FINAL REPORT

Return:
1. preflight worktree/branch/starting HEAD
2. verified PR #84 state
3. package files ingested
4. references/source masters committed vs omitted and why
5. exact runtime assets committed
6. exact target surface for each used asset
7. deferred assets and why
8. remaining small-navigation glyphs
9. remaining generic icon locations
10. Soapstone result
11. profile/avatar-frame result
12. shop/category result
13. collection/quest/blog/search/messages/notifications result
14. badge/achievement result or reason deferred
15. avatar outfit 3D dependency report
16. runtime transferred bytes/performance observations
17. responsive QA matrix
18. reduced-motion result
19. accessibility result
20. test/typecheck/lint/build result
21. security result
22. exact files changed
23. final commit SHA
24. Draft PR number/base/head
25. worktree cleanliness
26. confirmation of no merge/deploy/provider/DB/economy mutation
27. updated missing-asset register

STOP after this checkpoint.
Do not begin Petal Samurai art integration or full avatar-runtime consolidation in the same PR.
