# Otaku-mori Production Asset Authority Handoff v1

**Status:** Codex-facing production boundary  
**Purpose:** Minimize rediscovery and prevent placeholder/candidate assets from being promoted accidentally.

## 1. Authoritative documents

Codex should treat these as owner-side authority:

1. `otaku-mori-home-portrait-asset-authority-v1.md`
2. `otaku-mori-avatar-production-contract-v1.md`
3. `otaku-mori-base-character-visual-authority-v1.md`
4. `otaku-mori-avatar-authority-reconciliation-v1.md`
5. `otaku-mori-asset-creation-queue-v1.md`

Repository runtime truth controls what is currently implemented, but it does not override owner visual approval.

## 2. Precedence

1. latest explicit owner decision;
2. owner authority documents;
3. approved production registry record;
4. repository runtime contract;
5. legacy manifests/tooling;
6. placeholder/procedural/test assets.

Never silently reinterpret a higher-level authority to preserve a legacy implementation.

## 3. Asset-state model

`MISSING`
→ `CONCEPT`
→ `CANDIDATE`
→ `OWNER_APPROVED`
→ `RUNTIME_READY`
→ `INTEGRATED`
→ `QA_PASSED`

Also: `DEFERRED`, `REJECTED`.

Repository presence is not approval.

## 4. Existing systems to reconcile, not replace blindly

Reconcile with:

- `public/assets/manifest.json`
- `content/assets.manifest.json`
- `assets-roles.json`
- `app/lib/assets/scan.ts`
- `app/lib/assets/curate.ts`
- `app/lib/assets/registry.json`
- `public/assets/credits.json`
- game-specific manifests

The production registry answers a different question: whether an asset is approved, runtime-ready, integrated, and QA-passed.

## 5. Safety boundary

Default:

`NEON ACTION = NONE`

Asset governance does not require database branches.

Do not mutate Production, upload to Vercel Blob merely to inventory, replace approved runtime art without owner authority, purchase/source assets without license capture, run mass generation before vertical-slice approval, promote placeholders/procedural assets, or expose mock export formats as real.

## 6. Home portrait immediate boundary

Home portrait work follows `otaku-mori-home-portrait-asset-authority-v1.md`.

First production slice:

`home.world.late-afternoon.portrait-v1`

Do discovery first.

Do not produce all six states until portrait geometry is owner-approved.

Night uses the owner-approved Night wide master as lighting/world reference.

## 7. Avatar immediate boundary

Avatar is a convergence problem, not greenfield work.

Before implementation:

- inventory real candidate GLBs;
- audit the legacy base candidate;
- verify source/license/checksum;
- inspect skeleton/topology/morph/material quality;
- resolve React/R3F compatibility deliberately;
- preserve canonical persistence;
- do not create a third avatar architecture.

First vertical slices:

Female:
`female_base_v1` + `medium_wolf_01` + `commander_combat_01`

Male:
`male_base_v1` + `short_texture_01` + `urban_fantasy_01`

## 8. Game asset boundary

Do not reopen gameplay architecture merely because presentation assets are missing.

Priority unresolved production content:

- Beat-em-up player fighter art;
- Beat-em-up enemy family;
- Beat-em-up combat audio;
- Petal Storm authored tracks;
- Petal Storm authored charts.

Treat these as asset/content production unless a concrete runtime defect is discovered.

## 9. Codex execution style

Use delta-only, low-token operation.

Do:
- read the relevant authority file;
- inspect only the target asset family/runtime path;
- report actual missing/candidate/approved state;
- preserve checksums and provenance;
- make one bounded branch/PR per coherent production boundary;
- run affected tests only;
- stop at owner-review gates.

Do not:
- repeat project history;
- broad-reinventory closed systems;
- narrate routine commands;
- poll CI/Vercel repeatedly;
- self-approve visual art;
- merge Tier-0 visual changes without owner approval.

## 10. Minimum registry fields

Every production asset record should include, where applicable:

- stable ID;
- family;
- owning surface;
- purpose;
- source master;
- author/license/provenance;
- checksum;
- runtime path;
- format/dimensions or geometry metrics;
- skeleton version;
- compatible bodies;
- slot/conflicts;
- materials/textures;
- compression;
- LODs;
- physics;
- morph safety;
- safe zones/bounds;
- QA evidence;
- owner approval.

## 11. Stop conditions

Stop for owner review when:

- a new Tier-0 visual candidate exists;
- art direction requires subjective selection;
- an existing authority would be replaced;
- asset provenance/license is uncertain;
- a production state would move to `OWNER_APPROVED`;
- Home/Avatar is otherwise technically complete but presentation remains subjective.

## 12. Release principle

Technical completion and presentation approval are independent.

No Tier-0 surface is launch-approved solely because CI is green, a file loads, a config persists, a placeholder exists, or a runtime route renders.

The target is production convergence: correct, authored, performant, integrated, failure-safe, and owner-approved.
