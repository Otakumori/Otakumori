# Otaku-mori Avatar V2 Production Contract

Status: **Canonical implementation contract for the next avatar runtime.**

This document defines the production boundary for the Code Vein-inspired browser character creator. It intentionally supersedes ad-hoc runtime behavior in `packages/avatar-engine`, `app/components/avatar/*`, `app/lib/3d/model-loader.ts`, and game-specific GLB loaders. Those systems may remain temporarily as adapters during migration, but **new avatar runtime capability belongs in `@om/avatar`**.

## 1. Non-negotiable architecture

The runtime owns one character identity and multiple presentations.

```text
AvatarSpecV2
  -> canonical OM_Humanoid_v1 skeleton
  -> canonical body family
  -> modular hair/clothing/accessories/anatomy
  -> presentation resolver
       -> HQ anime/cel
       -> Retro low-poly
       -> FP
       -> TP
       -> creator framing
       -> game representation
```

A presentation mode must never create a second character identity. The saved record is configuration data, not a serialized GLB.

### Canonical package

`packages/avatar` is the source of truth for:

- schema/versioning;
- rig contract;
- asset manifest types;
- equipment/dress state;
- runtime quality policy;
- renderer/runtime services;
- serialization/migrations;
- server-side policy boundaries;
- game adapters.

`packages/avatar-engine` is migration-only. Do not add new features there.

## 2. Canonical skeleton

Rig ID: `OM_Humanoid_v1`.

The skeleton is an API. Bone names, parent relationships, reference pose, coordinate system, scale, and inverse-bind expectations are frozen after the first production body is approved.

Required rules:

- meters, Y-up, +Z forward at authoring/export boundary;
- one authoritative skeleton per assembled avatar;
- maximum four non-zero skin influences per vertex in delivery assets;
- normalized weights;
- no negative object scale;
- no unapplied armature scale;
- shared bind pose for body, clothing, hair physics roots, and anatomy modules;
- modular GLBs may contain an export-time duplicate armature, but runtime rebinding targets the canonical skeleton;
- facial deformation is primarily morph-target driven; structural body proportion changes may combine morphs with constrained bone scaling;
- all delivered LODs preserve bone indices and required morph semantics.

## 3. Body families and adult-content boundary

All canonical character bodies represented by the adult-capable creator are adult-coded.

The client specification may describe a requested dress/anatomy state, but it does **not** grant permission to load restricted assets. Authorization remains server-side.

```text
AvatarSpecV2 request
  -> server policy resolution
  -> resolved asset IDs/URLs
  -> runtime renderer
```

Do not infer restricted content from mesh/material names. Asset manifests carry explicit `contentRating` and `contentTags`. The current heuristic logic in `app/lib/3d/model-loader.ts` is not authoritative and must not be migrated.

Dress states:

- `full`;
- `underwear`;
- `nude`.

Clothing coverage is manifest-driven with body-region masks. Removing clothing reveals the same canonical body state rather than loading a separate unrelated nude character.

## 4. Asset families

Every production asset belongs to one class:

- `body`
- `head`
- `hair`
- `garment`
- `accessory`
- `anatomy`
- `animation`
- `material-set`
- `environment`
- `retro-proxy`

Each modular item has:

- immutable asset ID;
- schema version;
- compatible skeleton/body family;
- LOD URLs;
- optional Retro URL;
- material family;
- texture set;
- morph/corrective support;
- body-region coverage;
- attachment sockets if rigid;
- physics profile if secondary motion exists;
- content rating;
- source/provenance/license;
- authored triangle/draw-call estimates;
- measured/estimated GPU residency.

## 5. Delivery layout

Preferred object-storage layout:

```text
avatar/v2/
  canonical/
    om-humanoid-v1/
      body-feminine-01/
        lod0.glb
        lod1.glb
        lod2.glb
        manifest.json
      body-masculine-01/
        ...
  hair/<asset-id>/
      lod0.glb
      lod1.glb
      lod2.glb
      retro.glb
      manifest.json
  garments/<asset-id>/
      ...
  accessories/<asset-id>/
      ...
  animations/<library-id>/
      locomotion.glb
  textures/<texture-set-id>/
      *.ktx2
```

Do not bundle the wardrobe into the canonical GLB.

## 6. Source-to-browser pipeline

Authoritative source remains Blender/Maya source + lossless source textures.

```text
DCC source
  -> export staging glTF/GLB
  -> glTF validation
  -> skeleton signature check
  -> naming/material validation
  -> LOD/morph validation
  -> KTX2 conversion
  -> Meshopt compression
  -> final glTF validation
  -> manifest generation
  -> object storage/CDN
```

Production rules:

1. **No runtime decimation.** LOD0/1/2 and Retro are authored offline.
2. **No browser-side texture resizing.** Device-specific texture sets are produced ahead of time.
3. **No browser-generated material atlas.** Atlas/UV consolidation is an offline DCC/build process.
4. **No placeholder compression ratios.** Build scripts measure file and resource sizes.
5. **No unbounded `useGLTF` cache as wardrobe ownership policy.** Runtime residency is controlled by `AssetRepository`.

## 7. Geometry budgets

Representative total visible avatar budgets, including ordinary hair and clothing:

| Tier | Triangles | Intended use |
| --- | ---: | --- |
| LOD0 | 140k-220k | desktop close-up / high tier |
| LOD1 | 70k-110k | normal desktop / strong mobile |
| LOD2 | 30k-55k | low-end mobile |
| Retro | 8k-20k | authored retro presentation |

Per-asset manifests also carry their own geometry budgets. CI fails assets that exceed their class budget unless a reviewed override is recorded.

LODs preserve deformation-sensitive density around face, eyes, lips, shoulders, elbows, hands, pelvis, knees, and silhouette-critical garment edges.

## 8. Texture policy

Delivery textures use KTX2/Basis.

Default codec policy:

- UASTC: tangent-space normal maps, packed ORM/data maps, high-value face maps, critical alpha/cutout hair masks;
- ETC1S: conventional albedo/base-color maps where visual regression approves it, broad clothing/environment color textures, low-sensitivity accessory textures.

Starting resolution ceilings:

| Texture class | Low mobile | High mobile | Desktop |
| --- | ---: | ---: | ---: |
| face | 1024 | 2048 | 2048 |
| body | 1024 | 1024-2048 | 2048 |
| hair | 1024 | 1024 | 2048 selective |
| garment | 512-1024 | 1024 | 1024-2048 |
| small accessory | 256-512 | 512 | 512-1024 |

Texture quality is decided by visual regression and GPU residency, not source resolution.

## 9. Runtime loading ownership

Introduce a package-level `AssetRepository` during implementation.

Required semantics:

- `acquire(assetId)` increments asset reference count;
- `release(assetId)` decrements asset reference count;
- equipped/canonical assets cannot be evicted;
- zero-reference assets participate in LRU;
- resources are reference counted independently because multiple assets may share textures/materials;
- eviction disposes unique geometry/material/texture resources;
- skeleton-owned GPU resources are disposed when ownership reaches zero;
- repository-owned `<primitive>` objects render with `dispose={null}` so R3F does not violate shared ownership;
- cache budgets are quality-tier dependent.

Starting swappable-residency budgets excluding the pinned canonical body:

- LOW: 64-96 MiB;
- MEDIUM: 128-160 MiB;
- HIGH/desktop: 256-384 MiB.

These are application budgets, not claims about physical VRAM.

## 10. LOD selection

Distance-only LOD is insufficient for a character editor. Resolve LOD from projected character size plus quality-tier ceiling.

Rules:

- projected screen diameter is primary selector;
- 10-15% hysteresis prevents oscillation;
- LOW tier may never request LOD0;
- Retro bypasses the HQ LOD selector and uses an authored Retro proxy;
- category preview cards use dedicated thumbnails, never full 3D asset instances.

## 11. Rendering modes

### HQ anime/cel

Production material system separates skin, face, hair, eye, cloth, metal, and accessory families.

Face shading uses an authored face-light/SDF control map rather than raw N·L only.

Hair uses directional/anime highlight control rather than skin specular behavior.

Outlines are quality-tier aware and must not multiply scene draw calls uncontrollably.

### Retro

Retro changes both geometry and rendering:

- authored low-poly proxy;
- flat or quantized normals;
- restricted lighting ramp;
- nearest-filtered/retro texture presentation where authored;
- reduced internal render scale;
- optional subtle vertex snapping;
- stepped animation only if it remains comfortable in orbit/creator views.

Retro never reloads the character spec.

## 12. Camera contract

Creator camera presets:

- fullBody;
- portrait;
- face;
- torso;
- lowerBody;
- firstPerson.

FP camera follows a dedicated authored socket and suppresses head/eye/hair rendering for the FP camera using camera layers or equivalent visibility policy. Do not solve first-person clipping only through near-plane abuse.

## 13. Draw-call policy

Starting targets:

- character only: <=35 typical on LOW;
- full creator scene: <=60 normal;
- temporary ceiling: <=80 during controlled transitions.

Offline consolidation rules:

- merge compatible skinned primitives sharing skeleton/material;
- atlas compatible garment materials offline;
- use material masks/uniforms for dye variants;
- use `InstancedMesh` for repeated identical rigid accessories;
- consider `BatchedMesh` only for compatible rigid geometry, not as a substitute for correct skinned-mesh architecture.

## 14. Physics

Primary motion: skeletal animation.

Secondary motion: constrained, sparse bone simulation for hair clumps, ponytails, hems, jewelry, and selected soft accessories.

LOW starting budget: 24-48 actively simulated secondary bones.

Secondary simulation:

- fixed timestep, initially 30 Hz;
- interpolated render transforms;
- capsule/sphere collision proxy rig;
- sleep threshold;
- quality-tier disable/reduction;
- never full triangle cloth simulation on low-end mobile.

## 15. Frame-loop and prewarming

R3F uses `frameloop="demand"` only while the avatar is genuinely static.

Active states switch to continuous rendering:

- camera manipulation;
- morph tweening;
- skeletal animation;
- active secondary physics;
- animated shader state requiring frames.

Assets are prewarmed before an atomic swap:

1. load/decode;
2. rebind skeleton;
3. initialize textures;
4. compile shader programs against the target scene/light environment;
5. expose asset.

Use Three renderer precompilation APIs available to the current renderer version. Do not reveal an uncompiled garment and accept the first-frame hitch.

## 16. Adaptive DPR

Initial caps:

- LOW: min(native DPR, 1.0)
- MEDIUM: min(native DPR, 1.25)
- HIGH: min(native DPR, 1.5)
- ULTRA: min(native DPR, 2.0)

Runtime controller observes a rolling frame-time window.

Starting control policy:

- sustained p95 > 18 ms: reduce DPR by 0.125;
- sustained p95 < 14 ms for a significantly longer recovery window: increase DPR by 0.125;
- floor: 0.75;
- never exceed tier cap;
- temporary interaction reduction of 0.125-0.25 is allowed.

Quality recovery must be slower than degradation to avoid visible oscillation.

## 17. Development telemetry

The creator debug HUD must expose:

- FPS;
- median/p95/p99 frame ms;
- DPR and internal resolution;
- active quality tier;
- active LOD;
- draw calls;
- triangles;
- geometry count;
- texture count;
- shader/program count where available;
- AssetRepository resident/pinned/evictable bytes;
- active skinned meshes;
- active morphs;
- active secondary bones;
- physics CPU time;
- current asset-load/prewarm stage.

## 18. Release profiling floor

Minimum supported benchmark class is intentionally explicit:

- Android Chrome;
- approximately 4 GiB system RAM;
- Adreno 610-class or comparable Mali GPU;
- <=1080p viewport;
- 60 Hz panel.

Representative benchmark scene must include body + typical hair + typical upper/lower clothing + one accessory group + cel shader + normal creator lighting + secondary motion.

Release gates are measured after warm-up and again after a 10-20 minute thermal soak.

Initial acceptance targets:

- median >=55 FPS in representative creator interaction;
- normal p95 <=20 ms;
- normal draw calls <=60;
- LOD2 representative visible geometry <=55k triangles;
- prewarmed garment swap has no obvious multi-frame compilation hitch;
- repeated swap stress stabilizes resource counts;
- no WebGL context loss under normal supported workflows.

## 19. Migration rules

The following existing behaviors are explicitly non-canonical and should be replaced, not extended:

- runtime LOD generation placeholders in `app/lib/3d/model-loader.ts`;
- browser-side texture resizing via Canvas;
- browser-side material atlas construction;
- mesh-name/material-name adult-content inference;
- scene `.clone()` as a general solution for skinned-character reuse;
- perpetual sine-wave group translation as idle animation;
- independent avatar schemas in `@om/avatar-engine`;
- game-specific direct GLB loaders bypassing the canonical package.

## 20. Definition of ready for content scale

The system is ready for a large asset catalog only when:

- a new asset can be imported without runtime-code modification;
- validation either accepts it or explains exactly which contract failed;
- its runtime cost is known before download;
- it can be loaded, prewarmed, equipped, released, and evicted without leaking;
- it works under LOD1/LOD2 and its declared presentation modes;
- its provenance/license is recorded;
- one hundred representative swaps stabilize near the warm-cache resource baseline;
- FP/TP/HQ/Retro/dress-state permutations do not break the canonical skeleton or asset ownership model.
