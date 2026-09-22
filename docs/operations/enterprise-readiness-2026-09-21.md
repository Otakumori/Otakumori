# Enterprise readiness ledger - 2026-09-21

## Scope and hard stop

Read-only GitHub/Neon audit plus bounded local maintenance and the explicitly authorized 2026-09-22 visual-stack cleanup. No protection change, deployment, database migration, production data mutation, or secret exposure occurred.

## Verified checkpoint and convergence

| Item | Evidence |
| --- | --- |
| Original #87 head | e1cb3fdbaaa44125bb9c79b6bdadfd1f7e8c912b |
| Current main | 24ed868dcc5beee854c5c58ec0a92d9959201c3f |
| Current #87 authority | 150188350349c542a57851988d492eb0bd6a7909 (before this documentation-only follow-up) |
| Integration | Normal no-conflict merge; only package.json and pnpm-lock.yaml changed |
| Divergence | #87 is 75 commits ahead / 0 behind main |
| Visual lineage | #78, #81-#86 are strict ancestors of the integration branch |

#87 is now open, Draft, unmerged, mergeable, and targets main. Its complete accumulated visual diff is present (354 files at retarget verification), with all seven predecessor heads reachable. The PR description now correctly states that existing non-tassel Sakura crest candidates are available for owner QA before commissioning new reward art.

## Pull request disposition

| PR | State | Disposition | Preservation evidence |
| --- | --- | --- | --- |
| #87 | Open, Draft, mergeable; base `main` | KEEP - ACTIVE | Contains all predecessor heads plus integration merge |
| #86, #85, #84, #83, #82, #81, #78 | Closed, unmerged | SUPERSEDED BY #87 | Strict ancestors preserved in #87; each closure links to the verified successor |
| #72 | Draft | EXTRACT THEN RETIRE | One older visual-system commit; compare its 22 files with current authority |
| #68 | Draft | KEEP - UNIQUE UNMERGED WORK | Fail-closed Merchize-source commit absent from main; Preview schema differs |
| #40 | Draft | OWNER DECISION | Older seven-file visual pass is based on #29 |
| #29 | Open | KEEP - UNIQUE UNMERGED WORK | 106 commits include security, accounting, provider-write, and migration work absent from main |
| #28 | Open | OWNER DECISION | Six checkout/image commits remain outside main |
| #23 | Open | OWNER DECISION | 78-commit commerce skeleton requires separate extraction review |
| #20 | Open | EXTRACT THEN RETIRE | Six warning-cleanup commits; salvage only a current proven change |

## Remote branch inventory and classification

The pre-cleanup remote inventory had 60 non-main branches. The seven exact superseded refs listed below are now removed; MERGED - SAFE TO REMOVE means Git proves a remaining tip is reachable from main, but deletion still needs separate approval.

| Classification | Branches |
| --- | --- |
| KEEP - ACTIVE | codex/home-petal-authority-recovery; chore/commerce-schema-readiness-clean; fix/merchize-seller-source-fail-closed |
| REMOVED AFTER VERIFIED #87 PRESERVATION | codex/homepage-visual-foundation; codex/sitewide-visual-worldpass; codex/minigame-memory-defrag-foundation; codex/memory-defrag-identity-gamefeel; codex/memory-keeper-reactive-presentation; codex/mori-visual-asset-integration; codex/approved-visual-assets-batch-2 |
| SUPERSEDED - SAFE AFTER #29 decision | cursor/lock-provider-write-routes-be45; docs/readme-refresh; docs/visual-avatar-contracts; test/baseline-stabilization |
| MERGED - SAFE TO REMOVE | chore/bootstrap-production-prisma-migrate-workflow; chore/node24-runtime-management; chore/repository-operating-contract; chore/repository-truth-safety-harness; codex/pr74-petal-hotfix; cursor/fix-cursor-env-setup-126a; fix/admin-local-shop-management; fix/authenticated-data-boundary-readiness; fix/ci-baseline-health-gates; fix/clerk-navbar-account-state; fix/clerk-production-session-routing; fix/clerk-session-state-consistency; fix/homepage-h1-e2e-ambiguity; fix/inngest-current-head-security-cleanup; fix/merchize-hidden-import-safety-gates; fix/merchize-hidden-local-import; fix/merchize-hidden-local-import-apply; fix/merchize-readonly-provider-neutral-audit; fix/merchize-readonly-stabilization; fix/ota25-remove-clerk-backend-proxy; fix/post-node24-ci-cleanup; fix/printify-admin-preflight-apply; fix/printify-preflight-selected-count-display; fix/printify-product-scoped-variant-validation; fix/printify-selected-variant-recovery; fix/printify-stale-preflight-authorization; fix/production-prisma-migrate-approved-migrations; fix/provider-import-audit-migration; fix/provider-import-audit-postflight-index-verification; fix/provider-neutral-variant-identity-prep; fix/secure-controlled-catalog-sync; fix/storefront-sakura-design-system; fix/verify-only-postflight-baseline-counts |
| EXTRACT THEN RETIRE | chore/build-warning-cleanup; feat/mori-visual-foundation; fix/e2e-a11y-lighthouse-gates |
| HISTORICAL / REFERENCE | cursor/integration-42-43-verify; feat/om-avatar-physics-lab-mobile |
| OWNER DECISION | commerce-core-skeleton; fix/stripe-checkout-flow; visual/mori-storybook-homepage; chore/commerce-schema-readiness |
| INVESTIGATE | fix/catalog-sync-preview-env-guard |

fix/catalog-sync-preview-env-guard affects provider/debug/health boundaries and needs direct current-main review before retirement.

## Neon inventory and capacity

All queries were read-only. written_data_bytes: 0 means no branch-local write delta. The predecessor comparison covered application tables and columns, not byte-for-byte database images.

| Neon branch | ID | State | Application comparison | Disposition |
| --- | --- | --- | --- | --- |
| main | br-raspy-glitter-a506lvk3 | ready, default, unprotected | Baseline: 1 application table / 8 application columns; application fingerprint 88ca8002d7aee17b3ed48db3ea434911 | Retain |
| preview/chore/commerce-schema-readiness-clean | br-rough-frost-a5w2szsq | ready | Separate retained branch; not a visual cleanup candidate | Retain; #29 unique |
| preview/codex/home-petal-authority-recovery | br-green-shadow-a5t21vxv | ready | Active integration Preview; not a cleanup candidate | Retain while #87 active |
| preview/fix/merchize-seller-source-fail-closed | br-long-fog-a5ve1it7 | ready | Separate retained branch; not a visual cleanup candidate | Retain; #68 unique |

The exact five visual Preview branches were removed after name-to-ID verification: `preview/codex/homepage-visual-foundation` (`br-lucky-waterfall-a5hv49xl`), `preview/codex/minigame-memory-defrag-foundation` (`br-soft-breeze-a5q6f4tk`), `preview/codex/memory-defrag-identity-gamefeel` (`br-wild-cloud-a5fpb597`), `preview/codex/mori-visual-asset-integration` (`br-shy-river-a5cf78nr`), and `preview/codex/approved-visual-assets-batch-2` (`br-cool-lake-a5r8pejq`). Capacity is now 4/10 used with six free slots. Retain main permanently; retain the active integration Preview and #29/#68 Previews; require an isolated Preview only for DB-changing PRs; delete superseded/closed code-only Previews promptly; maintain at least four free slots; verify exact br-* IDs immediately before deletion.

The five candidate visual Previews have no unique application schema/data discovered; common Neon ACL/default-privilege metadata difference remains. Each has the same cloud_admin/neon_superuser default-privilege/ACL metadata difference also present in otakumori_production; the neondb comparison is empty. This is not a claim that any branch is byte-identical to main.

## Authority and validators

- Home authority: six protected 1325x1187 masters in docs/design/references/home-world-wide-approved/ and matching combined runtime states selected by app/components/hero/homeScene.ts.
- The twelve root/wide mori-world-* PNGs have no runtime references; they are superseded candidates, not yet deletion-safe.
- /mini-games is the active hub. /games is a legacy duplicate GameCube route with a hard-coded catalog; converge it separately.
- lib/games.meta.json is the runtime catalog authority used by HubClient, Navbar, and visual reconciliation tests. app/mini-games/games.meta.json and _data/registry.safe.ts are legacy compatibility/test inputs.
- The canonical-cover validator reports five missing covers: Petal Samurai, Memory Match, Otaku Beat-Em-Up, Petal Storm Rhythm, and Blossomware. Placeholder generation is disabled.
- Security-sensitive .safe alternatives and GameCubeHubV2.old.tsx are INVESTIGATE/OWNER DECISION artifacts, not safe deletions.

### Repaired test failures

| Original failure | Classification | Correct repair |
| --- | --- | --- |
| AchievementsGrid empty-state copy | stale test contract | Assert the current relic vocabulary and message |
| AchievementsGrid 50 percent summary | stale test contract | Assert current summary copy and current progress markup |
| AchievementsGrid 100 percent summary | stale test contract | Assert current summary copy and current progress markup |
| HeroContent arrival hierarchy | test harness/mock defect plus stale component boundary | Mock next/image locally and keep assertions scoped to HeroContent-owned controls |
| HeroContent unsafe-control assertion | test harness/mock defect | Mock next/image locally; preserve the negative security assertions |
| PetalCollection counter surface | test harness/mock defect | Mock next/image locally; preserve the collection and persistence assertions |
| Inngest serve-route import | test harness/mock defect | Correct test-relative mocks from ../../../inngest to ../../inngest so the real provider graph is not imported |

No actual runtime regression was found among the seven original failures.

| Gate | Result | Classification |
| --- | --- | --- |
| assets:verify | Executes; 24 classified missing manifest entries | Expected nonzero until remap or owner retirement |
| assets:validate | Executes and returns 0; path-only traversal | PASS with report-only findings |
| assets:check | 14 classified OG/category entries missing | Expected nonzero until the required assets or owner decisions land |
| assets:report | Passes; regenerates a tracked checklist | REPORT-ONLY; generated diff restored |
| assets:scan:images | Passes; regenerates a tracked reference scan | REPORT-ONLY; generated diff restored |
| icons:validate | Executes; five active canonical covers missing | GAME_PRESENTATION_ASSET_REQUIRED |
| typecheck | Pass | PASS |
| lint | Pass; 179 baseline warnings, 0 errors | PASS with baseline warnings |
| tests | 696 passed, 0 failed across 83 files | PASS; stale component contracts and incorrect Inngest mock paths repaired |
| security:scan | Pass; 0 blocking findings | PASS |
| docs:security:check | Pass; 0 blocking findings | PASS |
| build | Reached typecheck, lint, and Prisma client generation; stopped before Next build because local runtime configuration is absent | Environment-blocked; no database connection or mutation attempted |

### Unresolved asset classification

The validator manifest is not runtime authority by itself. These classifications preserve the backlog without creating replacement files or treating legacy paths as launch requirements.

| Item | Classification | Evidence / next owner action |
| --- | --- | --- |
| ui.glass-card | STALE_MANIFEST_ENTRY | No current application reference to public/assets/ui/glass/card-320.png |
| ui.glass-button | STALE_MANIFEST_ENTRY | No current application reference to public/assets/ui/glass/button-base.png |
| ui.petal-icon | STALE_MANIFEST_ENTRY | No current application reference to public/assets/ui/icons/petal.svg |
| ui.otm-logo | STALE_MANIFEST_ENTRY | No current application reference to public/assets/ui/branding/otm-logo.svg |
| games.memory-match.cards.back | EXISTING_ASSET_NEEDS_REMAP | Existing public/assets/memory/otm-card-back.svg is the candidate authority |
| games.memory-match.cards.set-killakill | EXISTING_ASSET_NEEDS_REMAP | Existing public/assets/memory/kill-la-kill SVG set needs an explicit owner-approved mapping |
| games.memory-match.frame | LEGACY_ONLY | Old manifest path is not an active Memory Defrag runtime input |
| games.memory-match.sfx.flip | LEGACY_ONLY | Old manifest path is not an active Memory Defrag runtime input |
| games.memory-match.sfx.match | LEGACY_ONLY | Old manifest path is not an active Memory Defrag runtime input |
| games.memory-match.sfx.mismatch | LEGACY_ONLY | Old manifest path is not an active Memory Defrag runtime input |
| games.petal-storm-rhythm.lanes | LEGACY_ONLY | Legacy static-manifest entry; do not synthesize lane art |
| games.petal-storm-rhythm.notes.normal | LEGACY_ONLY | Legacy static-manifest entry; do not synthesize note art |
| games.petal-storm-rhythm.notes.hold | LEGACY_ONLY | Legacy static-manifest entry; do not synthesize note art |
| games.petal-storm-rhythm.tracks.demo | LEGACY_ONLY | Legacy static-manifest entry; do not synthesize audio |
| games.samurai-petal-slice.sprites.katana | LEGACY_ONLY | Legacy GameCube entry, not current mini-game catalog authority |
| games.samurai-petal-slice.sprites.petal | LEGACY_ONLY | Legacy GameCube entry, not current mini-game catalog authority |
| games.samurai-petal-slice.backgrounds.dojo | LEGACY_ONLY | Legacy GameCube entry, not current mini-game catalog authority |
| games.samurai-petal-slice.sfx.slice | LEGACY_ONLY | Legacy GameCube entry, not current mini-game catalog authority |
| games.bubble-pop-gacha.sprites.bubble | LEGACY_ONLY | Legacy GameCube entry, not current mini-game catalog authority |
| games.bubble-pop-gacha.sfx.pop | LEGACY_ONLY | Legacy GameCube entry, not current mini-game catalog authority |
| shared.icons.achievement | STALE_MANIFEST_ENTRY | No current application reference to public/assets/shared/icons/achievement.svg |
| shared.icons.leaderboard | STALE_MANIFEST_ENTRY | No current application reference to public/assets/shared/icons/leaderboard.svg |
| shared.audio.ui-click | STALE_MANIFEST_ENTRY | No current application reference to public/assets/shared/audio/ui-click.ogg |
| shared.audio.achievement-unlock | STALE_MANIFEST_ENTRY | No current application reference to public/assets/shared/audio/achievement.ogg |
| /og/default-og.png | SEO_SHARE_ASSET_REQUIRED | Default share-card asset named by content/assets.manifest.json |
| /og/product-og-template.png | SEO_SHARE_ASSET_REQUIRED | Product share-card template named by content/assets.manifest.json |
| /banners/t-shirts.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/hoodies-sweatshirts.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/long-sleeves.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/tank-tops.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/hats.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/stickers.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/posters.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/phone-cases.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/mugs-drinkware.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/bags.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/accessories.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /banners/home-living.jpg | OWNER_DECISION | Category manifest-only entry; select or commission an owned banner before wiring |
| /games/petal-samurai/cover.jpg | GAME_PRESENTATION_ASSET_REQUIRED | Active lib/games.meta.json catalog cover |
| /games/memory-match/cover.jpg | GAME_PRESENTATION_ASSET_REQUIRED | Active lib/games.meta.json catalog cover |
| /games/otaku-beat-em-up/cover.jpg | GAME_PRESENTATION_ASSET_REQUIRED | Active lib/games.meta.json catalog cover |
| /games/petal-storm-rhythm/cover.jpg | GAME_PRESENTATION_ASSET_REQUIRED | Active lib/games.meta.json catalog cover |
| /games/blossomware/cover.jpg | GAME_PRESENTATION_ASSET_REQUIRED | Active lib/games.meta.json catalog cover |

## Protection, blockers, and owner action

- CRITICAL: main lacks #29 commerce/security work. Do not close/delete #29 or its predecessor safeguards. #68 separately adds a fail-closed Merchize seller-source check.
- HIGH: five canonical game covers and 14 SEO/category launch assets are missing.
- HIGH: Neon default main is unprotected. GitHub branch listing reports main unprotected and repository rulesets are empty. The GitHub integration cannot read detailed protection (403); inspect GitHub Settings > Branches/Rulesets and require PRs, status checks, and no force-push/deletion, then protect Neon main.
- MEDIUM: 24 obsolete manifest paths keep assets:verify red; route/catalog duplication and .safe forks remain code debt.
- LOW: pnpm emits deprecated package-level pnpm configuration warnings.

The verified visual-stack cleanup is complete: #87 is the current retained visual authority targeting main, #78/#81-#86 are closed as superseded, their seven exact Git branches are removed, and the five exact visual Neon Previews are removed. #29 and #68 remain protected for separate security/provider extraction review. The next phase is sitewide visual readiness; do not change visual authority or asset approvals as part of this ledger update. Protection hardening remains a separate owner/admin action.
