# `female_base_v1` acquisition result

Date: 2026-10-24

Baseline: PR #120, `8ea5c2bced7fd7b6cd3c7393e3ca3250fbb355f2`

Decision: **No repository or externally acquired asset qualifies as `female_base_v1`. The registry remains `MISSING`.**

## Sources evaluated

| Source                                                      | Rights evidence                                                                                                       | Intake/visual result                                                                                                                                                                                                                                                                                      | Decision                                                                |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `New/3877025201240060702.vrm`                               | Embedded VRM metadata: author Adi; corporate commercial use, modification, and redistribution disallowed              | 20,230 triangles; 85 bones; no canonical rig or production morphs                                                                                                                                                                                                                                         | Rejected: license and technical contract                                |
| `New/47910914135633122.vrm`                                 | Embedded VRM metadata: author Mitsukete; author-only use; commercial use, modification, and redistribution disallowed | 18,270 triangles; 59 bones; generic VRoid base; no canonical rig or production morphs                                                                                                                                                                                                                     | Rejected: license, visual direction, and technical contract             |
| `New/5447297406763866907.vrm`                               | Embedded VRM 1.0 metadata: author `siroihakumai`; corporate use, modification, and redistribution allowed             | 55,142 triangles; 131 bones; 23.1 MB; 22 materials; 46 textures; no canonical rig or production morphs. Neutral review renders show a clothed, childlike/generic VRoid silhouette rather than the required adult neutral base. No editable source master or attributable source URL accompanies the file. | Rejected: visual authority, source editability, rig, and morph contract |
| `New/6851608415014992982.vrm`                               | Embedded metadata has no attributable author; commercial use, modification, and redistribution disallowed             | 32,699 triangles; 121 bones; no canonical rig or production morphs                                                                                                                                                                                                                                        | Rejected: license/provenance and technical contract                     |
| `New/795710489256718664.vrm`                                | Embedded metadata: author Mitsukete; author-only use; commercial use and redistribution disallowed                    | Male model; 18,330 triangles; no canonical rig or production morphs                                                                                                                                                                                                                                       | Rejected: wrong base and license                                        |
| `New/winry.vrm`                                             | Embedded metadata has no attributable author; modification and redistribution disallowed                              | 27,104 triangles; 83 bones; no canonical rig or production morphs                                                                                                                                                                                                                                         | Rejected: license/provenance and technical contract                     |
| Legacy combined base GLB                                    | Existing CC-BY-4.0 record                                                                                             | Already deterministically rejected by PR #120: 1,408 bones, incompatible roots, no production morphs                                                                                                                                                                                                      | Remains rejected; not reworked                                          |
| Blender Human Base Meshes v1.4.1, `Body Female - Realistic` | Blender Studio/community; official CC0 distribution and editable `.blend` source                                      | Credible adult anatomical/topology reference, but the raw export has 22,248 triangles, no rig, no morphs, no production material contract, and insufficient Otaku-mori anime direction                                                                                                                    | Approved only as a production-authoring source, not a runtime candidate |
| Quaternius Universal Base Characters                        | Publisher declares CC0 and supplies editable source                                                                   | Approximately 13k triangles and deliberately low-poly/generic                                                                                                                                                                                                                                             | Development/retarget proxy only; rejected as Tier-0 visual authority    |

Official Blender source:

- Page: `https://www.blender.org/download/demo-files/`
- Archive: `https://download.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip`
- Archive bytes: `50,643,039`
- SHA-256: `811F43ACCBB31A88266D932F8F5563B2D13586FCA0BA2693AAD1F5FE582B3515`
- License: `CC0-1.0`
- Inspection boundary: acquired into ignored `.cache/avatar-source/`, then removed after hashing and inspection; no vendor/source archive is committed or served at runtime.

## Production/commission handoff

The safest path is a bespoke Otaku-mori sculpt derived from, or topology-informed by, the official CC0 Blender realistic female source. The source is not acceptable unchanged.

### Sculpt and silhouette

- Adult anime-stylized realism: approximately 60–65% anime-directed and 35–40% anatomical/material realism.
- Compact-to-average neutral frame with credible ribcage/pelvis transition, shoulders, hands, feet, nose bridge/tip, jaw, chin, and profile.
- The default must support petite, balanced, soft/curvy, athletic, and strong envelopes without baked extreme dimorphism.
- Reject impossible waist/arch anatomy, toy extremities, oversized head/eyes, flat facial profile, and generic VRoid/Ready Player Me proportions.

### Topology

- Final body plus head target: 35k–60k triangles.
- Deformation-safe loops at shoulders, elbows, wrists, fingers, hips, knees, ankles, neck, eyelids, lips, nasolabial area, jaw, and nostrils.
- Clean closed volumes; symmetrical base with intentionally asymmetrical detail deferred to textures/materials.
- Facial density must support all required Creator morphs without texture-only or bone-transform substitutes.
- Preserve an editable high-resolution sculpt and a production topology source; do not destructively overwrite either.

### Rig and bind

- Skeleton version: `om-humanoid-v1`; meter scale; `Hips` root; identity root transform.
- Required runtime bones: `Hips`, `Spine`, `Spine1`, `Spine2`, `Chest`, `Neck`, `Head`, bilateral `Shoulder`, `Arm`, `ForeArm`, `Hand`, `UpLeg`, `Leg`, `Foot`, and `ToeBase` names exactly as defined in `packages/avatar/src/productionContract.ts`.
- Shared bind pose and scale must remain compatible with the eventual male base, hair, outfits, accessories, and semantic animation map.
- Finger and optional secondary chains may be added, but cannot replace or rename the required runtime hierarchy.

### Morph delivery

Author all stable GLB target IDs from `AVATAR_MORPH_TARGETS`:

- Body: `height`, `weight`, `muscleMass`, `bodyFat`, `shoulderWidth`, `chestSize`, `waistSize`, `hipWidth`, `armLength`, `legLength`, `thighSize`, `calfSize`, `headSize`, `neckLength`.
- Face: `faceShape`, `jawline`, `cheekbones`, `chinShape`, `eyeSize`, `eyeSpacing`, `eyeHeight`, `eyeAngle`, `eyelidShape`, `eyebrowThickness`, `eyebrowAngle`, `noseSize`, `noseWidth`, `noseHeight`, `bridgeWidth`, `nostrilSize`, `noseTip`, `mouthSize`, `mouthWidth`, `lipThickness`, `lipShape`, `cupidBow`, `mouthAngle`.
- Each target must remain safe over its authored 0–1 range and in representative combined extremes. Corrective shapes are required where ordinary skinning or combined morphs collapse anatomy.

### Materials and textures

- Required semantic material slots: `skin` and `eyes`; brows/lashes may remain declared sub-slots if they do not fragment runtime control.
- Provide base color, normal, ORM, and explicit recolor masks where supported. Avoid photoreal pore detail, plastic response, global tinting, and baked dramatic lighting.
- Document texture resolution, color space, compression intent, and approximate GPU memory.

### Source and runtime delivery

- Editable source master: versioned `.blend` with sculpt, production mesh, rig, weights, morphs, materials, and non-destructive provenance notes.
- Runtime candidate: versioned GLB 2.0 with no cameras/lights, stable semantic names, checksum, license/author record, and no unrelated wardrobe/hair.
- Do not place the source master under `public/`. Runtime bytes remain a candidate until owner approval and intake acceptance.

### Required QA and owner evidence

- Intake JSON from `pnpm avatar:glb:validate` with geometry, rig, morph, material, texture, animation, and budget facts.
- Neutral warm-key/soft-fill/subtle-rim captures on charcoal: front, 3/4, profile, back, face front/3/4/profile, hands, and feet.
- Honest silhouette variants: petite/narrow, default, soft/curvy, and athletic/strong.
- Every capture identifies asset ID, checksum, viewport, quality tier, registry state, and morph preset.
- Owner must explicitly approve silhouette and face direction before hair or fitted outfit production begins.

## Promotion boundary

`female_base_v1` stays `MISSING`. A future real asset may move only to `CANDIDATE` after attributable source/license evidence, raw-source preservation, checksum capture, and intake reporting. Technical acceptance never implies `OWNER_APPROVED`.
