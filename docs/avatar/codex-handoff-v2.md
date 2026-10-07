# Codex Handoff: Avatar V2 Production Foundation

Use this file as the starting instruction for implementation work.

## Mission

Turn the existing fragmented avatar code into one production runtime under `@om/avatar`, preserving working behavior while replacing placeholder/unsafe implementation paths with the V2 contracts.

Do not build a new independent avatar system.

## Repository facts to respect

Current overlapping implementations include:

- `packages/avatar` — canonical target package; existing V1.5 policy/spec foundation;
- `packages/avatar-engine` — older/procedural/game-focused parallel engine;
- `app/components/avatar/*` — multiple historical editor/render paths;
- `components/avatar/*` — additional historical editor/runtime;
- `app/mini-games/_shared/GLBAvatarLoader.tsx` and related game-specific renderers;
- `app/lib/3d/model-loader.ts` — legacy loader with runtime LOD/texture/atlas placeholders.

V2 contracts are under `packages/avatar/src/v2`.

## Non-negotiable prohibitions

Do not:

- merge this work directly to `main`;
- modify active commerce PR work as part of avatar implementation;
- introduce a third/fourth canonical avatar package;
- generate LODs at runtime;
- resize production textures in Canvas at runtime;
- build production material atlases in the browser;
- infer adult/restricted content from object or material names;
- use client state as authorization for restricted assets;
- rely on `scene.clone()` as the general solution for reusing skinned avatars;
- leave an unbounded `useGLTF` cache as the wardrobe memory manager;
- add perpetual decorative `useFrame` loops when the avatar is otherwise static;
- commit vendor/source archives to ordinary Git history;
- use teen-proportioned fixtures in any adult-capable path.

## Implementation sequence

### AV2-0: Inventory and adapters

1. Build an import graph of all avatar renderers/loaders/stores/routes.
2. Mark each path canonical, adapter, migration-only, test/demo, or dead.
3. Add compatibility adapters so callers can move to `@om/avatar` incrementally.
4. Do not delete historical paths until usage is proven absent.
5. Produce a migration table in `docs/avatar/avatar-runtime-migration.md`.

Exit: no ambiguity about which runtime owns each caller.

### AV2-1: Loader and AssetRepository

Create under `packages/avatar/src/runtime/`:

- `createAvatarLoader.ts`
- `AssetRepository.ts`
- `ResourceRegistry.ts`
- `collectResources.ts`
- `prewarmAsset.ts`
- `bindCanonicalSkeleton.ts`

Requirements:

- GLTFLoader configured with KTX2 and Meshopt;
- KTX2 support detected from the actual renderer;
- one canonical skeleton per avatar;
- ref-counted assets;
- ref-counted shared textures/materials;
- LRU eviction of zero-reference assets;
- pinned canonical/equipped resources;
- explicit disposal;
- instrumentation hooks;
- cancellation/obsolete-load handling so rapid UI changes do not reveal stale selections.

Exit: repeated acquire/release cycles stabilize.

### AV2-2: Offline asset pipeline

Add build tooling under `scripts/avatar/`.

Required stages:

1. provenance check;
2. glTF validation;
3. skeleton validation/signature;
4. geometry/material statistics;
5. texture semantic classification;
6. KTX2 conversion according to policy;
7. Meshopt compression;
8. final validation;
9. V2 manifest generation.

Prefer a pinned toolchain rather than floating `npx latest` in CI.

Do not write irreversible processing back into source DCC files.

Exit: a staging GLB deterministically produces deployable artifacts + manifest.

### AV2-3: Runtime renderer

Build a renderer that consumes:

- `AvatarSpecV2`;
- server-resolved asset records;
- quality state;
- camera/presentation state.

Implement:

- canonical body load;
- modular skinned garment/hair rebinding;
- morph-driver graph;
- coverage/body suppression;
- HQ/Retro mesh switch;
- FP/TP camera visibility;
- cel material families;
- prewarmed atomic swaps;
- deterministic cleanup.

V1.5 renderer remains available during migration.

Exit: one representative character survives HQ/Retro + FP/TP + outfit swaps without reload/leak.

### AV2-4: Creator UI integration

Desktop:

- category rail;
- dominant viewport;
- property inspector;
- explicit view/style/dress controls.

Mobile:

- full-screen viewport;
- bottom sheet with collapsed/medium/expanded states;
- pointer capture;
- body-region focus;
- large touch sliders;
- no sidebars squeezed into phone width.

The DOM remains outside Canvas unless an element genuinely belongs in 3D space.

Exit: creator is fully operable at 390x844 and desktop without horizontal overflow.

### AV2-5: Frame and memory controller

Implement:

- performance-tier initialization;
- projected-size LOD selector + hysteresis;
- adaptive DPR with slow recovery;
- static `demand` loop;
- active-loop escalation during camera/morph/animation/physics;
- 30 Hz fixed-step secondary physics on constrained tiers;
- sleeping;
- draw-call and residency budgets;
- renderer/repository dev HUD.

Exit: quality degrades predictably before severe frame collapse.

### AV2-6: Policy and restricted asset resolution

Keep permission logic server-side.

Resolve requested equipment/dress/anatomy against:

- account/session policy;
- age verification;
- feature availability;
- asset content rating;
- safe fallbacks.

The renderer receives only approved resolved assets.

Exit: manipulating client JSON cannot obtain a restricted URL that server policy would not resolve.

### AV2-7: Game migration

Games consume the same saved AvatarSpecV2 but request representation presets.

Migrate game-specific GLB loaders to the package adapter.

Keep game-specific camera/combat logic outside the core character identity.

Exit: at least one full-body game and one portrait/bust consumer use the canonical runtime.

## Required tests

Unit:

- AvatarSpecV2 parsing/defaults;
- migration from V1.5;
- asset manifest validation;
- skeleton hierarchy/signature payload;
- quality-tier DPR/LOD behavior;
- LRU order/refcount behavior;
- shared-resource disposal;
- coverage resolver;
- server policy resolution.

Integration:

- canonical + one garment;
- canonical + shared texture across two garments;
- rapid A -> B -> C selection with obsolete B load completing last;
- HQ -> Retro -> HQ;
- TP -> FP -> TP;
- context-loss reconstruction;
- restricted request resolving to approved fallback.

Stress:

- 100 garment swaps;
- 100 hair swaps;
- 50 color changes;
- 30 morph changes;
- 20 LOD transitions;
- 20 camera transitions;
- 10 HQ/Retro transitions.

Resource counts must stabilize near warm-cache baseline.

## Representative performance gate

Minimum profile target:

- Android Chrome;
- ~4 GiB system RAM;
- Adreno 610-class/comparable Mali;
- <=1080p;
- 60 Hz.

Representative scene includes body, normal hair, upper/lower clothing, one accessory group, cel shading, creator lighting and secondary motion.

Initial release criteria:

- median >=55 FPS;
- normal p95 <=20 ms;
- normal creator draw calls <=60;
- LOD2 representative visible geometry <=55k triangles;
- no obvious shader-compilation hitch after prewarm;
- stable resource counts after churn;
- no normal-workflow context loss.

## Required validation before each PR

Run the repository's normal checks plus avatar-specific tests.

At minimum:

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm exec vitest run packages/avatar/src/__tests__
node scripts/avatar/fetch-open-dev-assets.mjs   # local/dev only when fixtures are needed
corepack pnpm exec tsx scripts/avatar/validate-manifests.ts <manifest paths>
git diff --check
```

Do not weaken existing assertions to make migration pass.

## Art-source direction

Use `docs/avatar/asset-procurement-ledger.md`.

Important:

- Blender Human Base Meshes are an authoring base, not final identity.
- Quaternius adult-coded Regular/Superhero assets are technical/Retro candidates, not HQ authority.
- Quaternius Teen variants are excluded from adult-capable use.
- final HQ bodies/faces/hair/anatomy/signature clothing require bespoke authoring.
- record source/license/hash before an external asset becomes part of production.

## Completion definition

The foundation is complete when adding a new conforming garment requires:

1. author/export asset;
2. run asset build;
3. receive manifest;
4. register/upload asset;

and **does not require editing renderer code**.
