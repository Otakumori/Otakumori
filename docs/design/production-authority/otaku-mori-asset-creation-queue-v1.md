# Otaku-mori Asset Creation Queue v1

**Status:** Owner-side production queue  
**Purpose:** Establish the smallest high-value asset-production order without mass-generating or sourcing unnecessary work.

## Queue doctrine

Work in vertical slices.

For each family:

**discover existing material → classify → produce only what is missing → owner approve → runtime prepare → integrate → QA**

Do not scale a family before its first representative slice proves the contract.

## P0 — Home Flagship Closure

### P0.1 Owner Night wide master

Target: `home.world.night.wide-v1`

Locate owner source, install under canonical stable filename, preserve provenance/checksum, and verify runtime selection.

Do not approximate with CSS.

### P0.2 Late-afternoon portrait vertical slice

Target: `home.world.late-afternoon.portrait-v1`

Goal: freeze portrait composition geometry.

Requirements:
- 390×844 primary composition;
- same physical Home world;
- intentional tree framing;
- castle/horizon preserved;
- Hero/search safe zone;
- clear root descent;
- footer/Soapstone negative space;
- no broad dark footer slab.

Gate: OWNER APPROVAL REQUIRED.

### P0.3 Remaining Home portrait states

After P0.2 approval:

- `home.world.early-morning.portrait-v1`
- `home.world.morning.portrait-v1`
- `home.world.afternoon.portrait-v1`
- `home.world.night.portrait-v1`
- `home.world.special-twilight.portrait-v1`

All inherit approved portrait geometry.

### P0.4 Home signature artifacts

Audit/finalize only if still inadequate after the current Home correction:

- Petal Wallet blossom nav emblem;
- Petal Wallet satchel artifact;
- Soapstone resting rune/artifact presentation.

Avoid creating replacements when approved assets already exist.

## P1 — Avatar Base Production

### P1.1 Legacy candidate audit

Verify actual file, provenance/license, checksum, topology, skeleton, scale/orientation, morph targets, materials, visual quality, and source editability.

Outcome: `CANDIDATE`, `REJECTED`, or usable input to a production base. Never auto-approve.

### P1.2 Female production base

Target: `female_base_v1`

Must satisfy adult anime-stylized realism, credible anatomy, face quality from front/3/4/profile, good hands/feet, deformation-safe topology, canonical skeleton, launch morph vocabulary, material separation, and editability.

### P1.3 Male production base

Target: `male_base_v1`

Same technical bar, with its own authored silhouette/face rather than superficial remapping of the female mesh.

### P1.4 Skeleton v1 freeze

Freeze bone list, hierarchy, root convention, scale, bind-pose convention, optional secondary chains, and version ID before wardrobe scales.

### P1.5 Launch morph set freeze

Freeze semantic names, safe ranges, dangerous-combination tests, persistence mapping, and clothing compatibility requirements.

## P2 — Avatar Female Vertical Slice

Targets:
- `medium_wolf_01`
- `commander_combat_01`
- enough skin/eye/hair materials to prove light/medium/deep skin, dark/pale hair, recolorable iris, and material distinction.

Proof:

`female_base_v1`
→ face/body morph
→ `medium_wolf_01`
→ `commander_combat_01`
→ materials
→ save
→ hard reload
→ same visible identity
→ Commander
→ edit again
→ no drift

Gate: OWNER VISUAL REVIEW.

## P3 — Avatar Male Vertical Slice

Targets:
- `short_texture_01`
- `urban_fantasy_01`

Repeat the full persistence/Commander/resource-cleanup proof.

Gate: OWNER VISUAL REVIEW.

## P4 — Avatar Launch Catalog Expansion

Only after P2 and P3 pass.

Hair:
- `long_layered_01`
- `long_straight_01`
- `bob_01`
- `ponytail_01`
- `updo_01`
- `alt_asymmetric_01`

Tops:
- `fitted_highneck_01`
- `cropped_structured_jacket_01`
- `dark_soft_blouse_01`

Bottoms:
- `highwaist_trouser_01`
- `asymmetric_skirt_01`
- `utility_skirtshort_01`

Full looks:
- `gothic_dress_01`

Shoes:
- `platform_boot_01`
- `combat_boot_01`
- `minimal_lowboot_01`

Accessories:
- `choker_minimal_01`
- `earrings_drop_01`
- `earrings_stud_01`
- `glasses_round_01`
- `glasses_narrow_01`
- `hairpin_bronze_01`
- `pendant_01`
- `wrist_cuff_01`

No tassels by default.

## P5 — Commander Identity Presentation

After avatar persistence is canonical:

- creator saved identity;
- Commander same identity;
- authored 3D fallback;
- edit-return round trip;
- representative mobile/desktop presentations.

Do not fabricate achievements/player data to make presentation look populated.

## P6 — Flagship Game Production Content

Protect gameplay architecture unless a concrete regression exists.

Beat-em-up:
1. player fighter art;
2. enemy family;
3. combat impact/audio family;
4. presentation polish.

Petal Storm:
1. authored launch tracks;
2. authored charts;
3. chart/audio QA;
4. difficulty/content packaging.

Memory Keeper / Defrag and Petal Samurai: only produce missing presentation art/content demonstrated by current QA.

## P7 — Secondary Surface Asset Closure

After Tier-0:
- Search/discovery signature imagery;
- account/auth states;
- transactional email/support visuals;
- errors/empty/loading/maintenance;
- moderation/community;
- remaining Tier-1/Tier-2 asset gaps.

## Production gates per asset

`MISSING`
→ `CONCEPT`
→ `CANDIDATE`
→ `OWNER_APPROVED`
→ `RUNTIME_READY`
→ `INTEGRATED`
→ `QA_PASSED`

No asset skips owner approval where visual authority is subjective.

For sourced assets, license/provenance is mandatory before `OWNER_APPROVED`.

For generated assets, source prompt/reference/provenance and editable master should be retained where practical.

## Current next action

After the current Home PR correction finishes:

**discover/recover source material for `home.world.late-afternoon.portrait-v1`, then produce exactly one late-afternoon portrait candidate for owner review.**

Do not start the full six-state portrait family before that candidate is approved.
