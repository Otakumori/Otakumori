OTAKU-MORI CODEX CHECKPOINT
APPROVED VISUAL ASSETS BATCH 2
EMPTY STATES + DESTINATIONS + AVATAR CREATOR + GAME CATALOG ART

Repository:
Otakumori/Otakumori

Attachment:
otakumori-approved-visual-assets-batch-2.zip

==================================================
0. CHECKPOINT OBJECTIVE
==================================================

Ingest and selectively integrate the owner-approved visual assets in this package.

This package is a VISUAL + CATALOG-PRESENTATION checkpoint.

It is NOT authorization to:
- rewrite game mechanics
- change reward/economy authority
- rebuild the avatar renderer
- merge/deploy
- mutate providers or databases
- invent new application state merely to display artwork

The package intentionally includes only artwork approved after the prior
`otakumori-mori-status-ornaments-v1.zip` handoff.

Rejected and superseded generations are intentionally excluded.

==================================================
1. PREFLIGHT: CURRENT REPOSITORY IS TRUTH
==================================================

Before touching files:

1. Inspect GitHub PR stack and current Draft PRs.
2. Identify the current approved visual parent branch.
3. Verify all relevant PRs are open/Draft/unmerged as expected.
4. Record current branch/head/worktree.
5. Audit dirty state.
6. Do not modify any existing Draft visual PR directly unless it is explicitly
   the intended base and remains unchanged.

Create a new isolated stacked branch from the CURRENT approved visual parent.

Suggested branch:
`codex/approved-visual-assets-batch-2`

Do NOT rely on historical SHAs embedded in old conversation handoffs.

STOP if:
- unexplained dirty state appears
- current stack ancestry cannot be reconciled without destructive history editing
- a credential is rendered
- provider/DB mutation becomes necessary
- a force push would be required to preserve the stack
- the package checksum fails

==================================================
2. PACKAGE INTAKE
==================================================

Verify:
`ASSET-SHA256.txt`

Read:
- README-CODEX.md
- docs/design/visual-authority/asset-manifest.json
- docs/design/visual-authority/approval-ledger.json
- docs/design/visual-authority/game-catalog-authority.json

Copy the CONTENTS of the package into repository root.
Do not create a nested wrapper directory.

Reconcile existing files by semantic role.
Do not blindly overwrite newer authoritative assets.

==================================================
3. APPROVAL BOUNDARY
==================================================

Every asset listed as `approved: true` in `asset-manifest.json` is owner approved.

Do not redraw, restyle, or replace these assets in this checkpoint.

Explicit exclusions matter:

- Do not resurrect rejected cart illustrations.
- Empty Cart uses `mori-empty-cart-kinchaku`.
- Do not map `gilded_sakura_petal_relic` to Petal Wallet, currency, or another
  semantic role. It remains deferred.
- Do not add any generated contact sheet, collage, montage, mockup, or approval
  sheet as runtime art.
- Do not use superseded Thigh Colosseum art.

==================================================
4. EMPTY STATES
==================================================

Approved mappings:

`mori-empty-cart-kinchaku`
-> Empty Cart state
-> IMPORTANT: this is NOT Petal Wallet

`mori-empty-wishlist`
-> Wishlist/Favorites empty state

`mori-empty-messages`
-> Messages/community empty state

`mori-empty-collection`
-> Collection/library empty state

`mori-empty-search-results`
-> No search results

Integration requirements:

- preserve existing empty-state semantics and copy
- artwork is decorative/supportive, not the only explanation
- do not alter route/auth/data behavior
- do not fabricate "empty" state for visual QA
- use current visual-QA mechanisms where necessary

==================================================
5. DESTINATION / FEATURE ART
==================================================

Approved:

`mori-destination-orders`
`mori-destination-admin`
`mori-destination-achievements`
`mori-destination-trade-center`
`mori-destination-music-player`

Audit each target route/component before use.

High-level rule:
feature imagery belongs in destination headers, cards, empty/intro states, or
medium/large presentation surfaces.

Do NOT turn these into 16px navbar icons.

Do not imply admin access, achievements, orders, or account state that does not exist.

==================================================
6. AVATAR CREATOR PRESENTATION
==================================================

Approved stage/presentation assets:

`avatar-creator-stage-plinth`
`avatar-creator-backplate-arch`
`avatar-creator-equipment-slot-frame`
`avatar-creator-cosmetic-token`
`avatar-creator-grounding-ring`
`avatar-creator-preset-reliquary`

Before integration, inspect the actual avatar architecture and current 3D/runtime
ownership.

Presentation is allowed to wrap the live avatar.
Presentation must NOT become a competing avatar runtime.

Specific boundaries:

PLINTH
- under live model
- neutral enough not to recolor model
- no fake character sprite

BACKPLATE ARCH
- behind live model
- preserve open center
- must not block camera/avatar pointer interactions

EQUIPMENT SLOT FRAME
- UI thumbnail chrome only
- preserve semantic selection/focus on actual controls

COSMETIC TOKEN
- neutral presentation base
- rarity color/meaning stays programmatic
- art cannot invent rarity

GROUNDING RING
- presentation/selection ground layer
- optional subtle transform/opacity motion only
- reduced-motion static equivalent

PRESET RELIQUARY
- saved-look/preset visual or empty state
- does not replace actual saved preset data

==================================================
7. AVATAR CREATOR CATEGORY GLYPHS
==================================================

Approved:

`avatar-category-hair`
`avatar-category-face`
`avatar-category-eyes`
`avatar-category-body`
`avatar-category-outfit`
`avatar-category-accessories`
`avatar-category-weapon-prop`

Weapon/Prop is intentionally a combined SWORD/GUN category symbol.

Do not split it into two icons in this checkpoint unless the current information
architecture already has separate canonical categories.

Test each glyph at:
48px
64px
80px
96px

If visual legibility is poor at the smallest supported target:
retain accessible text and/or current compact functional icon rather than
over-sharpening the raster.

==================================================
8. AVATAR CREATOR ACTION GLYPHS
==================================================

Approved:

`avatar-action-color-material`
`avatar-action-presets`
`avatar-action-randomize`
`avatar-action-undo-reset`
`avatar-action-save`
`avatar-action-preview`

Artwork does not create action authority.

Examples:
- Save only executes the existing valid save path.
- Randomize must use existing canonical randomization rules.
- Undo/reset must use current reversible state ownership.
- Preview must not create a second avatar.
- Presets must reflect real persisted/local preset state.
- Color/material art does not define allowed palettes.

==================================================
9. GAME CATALOG: CANONICAL PRESENTATION UPDATE
==================================================

Read:
`game-catalog-authority.json`

This package establishes updated VISUAL/CATALOG direction for:

BUBBLE RAGDOLL
- renamed/reframed from Bubble Girl direction
- contained front/slight-3/4 physics room
- waifu/husbando avatar options
- polished ragdoll/interaction focus
- mature-theme capability remains a separate art/content concern

MAID CAFÉ MANAGER
- re-integrated prior concept
- third-person management/life-sim
- Diner-Dash-like service loop
- shift outcomes affect next-day scenarios
- tied to avatar identity
- DO NOT implement the whole game here

THIGH COLOSSEUM
- side-scrolling / Metroid-like
- comedy action
- thigh-crush gimmick
- escalating stages
- unlockable skins/maps
- final approved art contains no enemy dialogue/callouts

PUZZLE REVEAL
- top-down/archive-table presentation
- categories: Lore, Career, Anime, Gaming, Random
- dynamic puzzles
- avatar identity can inform presentation
- DO NOT build new puzzle-generation logic here unless it already exists and
  only needs non-behavioral metadata wiring

DUNGEON OF DESIRE
- first-person RPG
- customizable protagonist
- succubus antagonist
- inventory management
- dungeon/lore ties
- public-safe visual layer and mature-theme layer must remain architecturally separable
- DO NOT implement mature content or the RPG mechanics in this visual checkpoint

==================================================
10. GAME ART MAPPINGS
==================================================

Approved case + hub pairs:

Bubble Ragdoll:
`game-bubble-ragdoll-cover`
`game-bubble-ragdoll-hub`

Maid Café Manager:
`game-maid-cafe-manager-cover`
`game-maid-cafe-manager-hub`

Thigh Colosseum:
`game-thigh-colosseum-cover`
`game-thigh-colosseum-hub`

Puzzle Reveal:
`game-puzzle-reveal-cover`
`game-puzzle-reveal-hub`

Dungeon of Desire:
`game-dungeon-of-desire-cover`
`game-dungeon-of-desire-hub`

COVER:
- physical Otaku-mori case presentation
- use in showcase/catalog contexts only
- not the default tiny card image

HUB:
- near-square key art
- use for mini-game hub/game-selection presentation
- preserve important focal point during responsive crops

Do not:
- fake console branding
- add ESRB/third-party platform marks
- auto-generate a new cover family
- rewrite titles inside the images
- use old Bubble Girl/Thigh art when the new catalog art exists

==================================================
11. CURRENT MINI-GAME METADATA RECONCILIATION
==================================================

Audit:
- `app/mini-games/**`
- game metadata JSON files
- route mapping
- current GameCube-style hub or current equivalent
- tests asserting game names/routes
- any saved game identifiers

Do NOT casually rename stable internal IDs if doing so would break URLs, saves,
analytics, tests, or persisted state.

Preferred strategy:

DISPLAY NAME may become canonical new presentation name.

STABLE INTERNAL ID / ROUTE may remain historical if changing it is unsafe.

If Bubble Girl currently exists as a stable route/ID:
- update display/catalog presentation to Bubble Ragdoll
- preserve stable route unless there is a proven safe migration plan
- document alias/migration need

If Maid Café Manager has no current route:
- add catalog metadata / visually disabled "planned" surface only if the current
  architecture already supports planned/coming-soon entries cleanly
- otherwise DO NOT invent a dead route
- report the required implementation checkpoint

This checkpoint must not turn a visual/catalog addition into a half-built game.

==================================================
12. PERFORMANCE / ENTERPRISE PARAMETERS
==================================================

Runtime assets are already supplied as WebP.

Do not serve source PNG masters to browsers.

Requirements:
- self-hosted assets only
- explicit width/height or stable aspect ratio
- prevent CLS
- lazy loading by default
- async decoding by default
- only priority-load demonstrated above-fold LCP candidates
- do not preload the whole game catalog
- no base64/data URI duplication
- preserve alpha
- no new animation library for these assets
- no raster frame-loop animation
- use transform/opacity on wrappers where motion is appropriate
- honor prefers-reduced-motion
- do not add filter-heavy glow/blur stacks to large art

For game-hub images:
- test actual responsive crops
- use `object-position` or equivalent focal placement
- no faces/action focal points cut at standard viewports

==================================================
13. ACCESSIBILITY
==================================================

All game and avatar actions retain semantic labels independent of artwork.

Decorative images:
alt=""
aria-hidden where appropriate

Meaningful cover/key art:
use concise appropriate alt text when it communicates content beyond adjacent text.

No raster icon is the sole accessible name of a control.

At 200%/400% zoom:
- controls remain usable
- art does not force horizontal scroll
- hub tiles remain readable

==================================================
14. VISUAL QA MATRIX
==================================================

Capture baseline before modifying every affected surface.

Minimum final QA:
390x844
430x932
768x1024
1024x768
1280x900
1440x900
1920x1080

Also:
- reduced motion
- keyboard-only
- 200% zoom
- 400% reflow where practical
- signed-in/out where affected
- avatar creator pointer/camera interaction
- game hub responsive crop checks

Audit:
- no alpha matte
- no fuzzy icon scaling
- no over-decoration
- no image intercepting pointer input
- no art hiding semantic labels
- no stale old game cover still visible
- no wrong Bubble Girl display naming after intended catalog reconciliation
- no dead Maid Café link
- no old/superseded Thigh art

==================================================
15. TEST / BUILD / SECURITY
==================================================

Run appropriate focused tests, plus:

pnpm type-check
pnpm lint
git diff --check
pnpm security:scan
pnpm docs:security:check
pnpm build

Use only established process-scoped safe placeholder env values if necessary.

Do not create env files.

Do not "fix" unrelated baseline Prettier/lint/security warnings unless directly
caused by this checkpoint.

==================================================
16. SECURITY + MUTATION BOUNDARIES
==================================================

NO:
- Production deploy
- merge
- Ready transition
- DB mutation
- migrations
- seeds/resets
- provider mutation
- Stripe/Printify/Merchize action
- Vercel env change
- Petal grants
- achievement writes
- secret output
- auth weakening

Mature-theme game direction must not weaken public-route or age/content boundaries.
This checkpoint is visual/catalog only.

==================================================
17. COMMIT + DRAFT PR
==================================================

After successful validation:

Push the isolated branch.

Open a Draft PR against the current approved visual parent.

Suggested title:
`feat: integrate approved Mori visual assets batch 2`

Do not merge.
Do not mark Ready.
Do not deploy.

==================================================
18. FINAL REPORT
==================================================

Return:

1. worktree
2. branch
3. starting HEAD
4. verified parent PR/branch/head
5. package checksum result
6. exact approved source masters ingested
7. exact runtime WebPs committed
8. exact empty-state placements
9. exact destination-art placements
10. avatar creator presentation integration
11. avatar category/action glyph integration
12. glyph legibility matrix
13. game cover/hub mappings
14. game metadata/display-name reconciliation
15. Bubble Ragdoll internal ID/route decision
16. Maid Café Manager catalog/route decision
17. Thigh Colosseum old-art cleanup result
18. Puzzle Reveal presentation result
19. Dungeon public-safe separation result
20. intentionally deferred assets
21. transferred bytes/performance observations
22. accessibility/reduced-motion results
23. responsive QA matrix
24. focused tests
25. typecheck/lint/build/security results
26. exact files changed
27. final commit SHA
28. Draft PR number/base/head
29. worktree cleanliness
30. explicit no-merge/no-deploy/no-provider/no-DB/no-economy-mutation confirmation
31. next recommended implementation checkpoint

STOP.

Do not begin the game-runtime implementation packs in this PR.
