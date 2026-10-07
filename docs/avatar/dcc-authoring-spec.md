# Avatar V2 DCC Authoring Specification

Status: production authoring contract for `OM_Humanoid_v1`.

Recommended production DCC baseline: **Blender 5.2 LTS** with the exact patch version pinned in the asset-build environment. Blender currently maintains both 5.2 LTS and 4.5 LTS; use one pinned version per production branch rather than allowing artists/CI to drift.

## 1. Coordinate and scale contract

### Blender authoring

- Blender coordinate system: Z-up.
- 1 Blender unit = 1 meter.
- Canonical character stands at world origin.
- Character faces **-Y in Blender** so the glTF runtime representation resolves to the project's canonical forward axis.
- Armature object location = `0,0,0`.
- Armature object rotation = `0,0,0`.
- Armature object scale = `1,1,1`.
- Skinned mesh object scale = `1,1,1`.
- No negative scale on delivery objects.
- Apply object transforms before skinning/export except where an approved workflow explicitly requires otherwise.

### Runtime

- glTF/Three.js world: Y-up.
- Canonical character forward: +Z.
- Height is measured from ground plane to top of neutral head/hair-excluded body.

## 2. Bind pose

Canonical bind pose is a relaxed A-pose.

Requirements:

- feet flat and parallel;
- knees neutral;
- pelvis centered;
- spine neutral;
- shoulders not shrugged;
- arms approximately 35-45 degrees below horizontal;
- elbows nearly straight;
- palms oriented consistently;
- fingers in neutral relaxed extension;
- head level;
- eyes forward.

Do not modify the bind pose after production clothing begins. Animation retargeting handles source-pose differences.

## 3. Scene organization

Each source asset file uses predictable collections:

```text
OM_<asset-id>
  00_REFERENCE
  10_RIG
  20_SOURCE
  30_LOD0
  40_LOD1
  50_LOD2
  60_RETRO
  70_COLLISION
  80_EXPORT_HELPERS
```

Only the intended export collection is selected during a delivery export.

Do not export:

- sculpt reference meshes;
- high-resolution bake cages;
- lights;
- cameras;
- Blender-only control rigs;
- geometry-node construction helpers;
- hidden duplicate skeletons not required by the staging glTF.

## 4. Naming

Asset ID examples:

- `body-feminine-01`
- `body-masculine-01`
- `hair-hime-long-001`
- `upper-commander-coat-001`
- `lower-pleated-skirt-001`
- `accessory-earring-chain-001`

Object names:

```text
BODY__feminine-01__LOD0
BODY__feminine-01__LOD1
BODY__feminine-01__LOD2
BODY__feminine-01__RETRO

HAIR__hime-long-001__LOD0
...
```

Material names use functional families rather than arbitrary art names:

- `MAT_SKIN`
- `MAT_FACE`
- `MAT_EYE`
- `MAT_HAIR_OPAQUE`
- `MAT_HAIR_ALPHA`
- `MAT_CLOTH_0`
- `MAT_CLOTH_1`
- `MAT_METAL`
- `MAT_ACCESSORY`

The build pipeline may replace these with runtime shader families, but stable names make validation deterministic.

## 5. Skeleton

Required runtime bones are defined in `packages/avatar/src/v2/skeleton.ts`.

Production rigs may add:

- eye bones;
- jaw;
- full fingers;
- twist/helper bones;
- breast/soft-tissue helper bones where appropriate;
- hair roots;
- garment secondary-motion roots;
- weapon/prop sockets.

Additive bones must not rename or re-parent the required hierarchy.

Finger naming recommendation:

```text
thumb_01_l ... thumb_03_l
index_01_l ... index_03_l
middle_01_l ... middle_03_l
ring_01_l ... ring_03_l
pinky_01_l ... pinky_03_l
<mirror _r>
```

Face bones are optional if the final facial system is morph-driven. Eye and jaw bones are recommended.

## 6. Skin weights

Delivery constraints:

- maximum 4 non-zero joint influences per vertex;
- normalized weights;
- no unweighted vertices;
- no weights to DCC control bones that are absent from the export skeleton;
- deform-preserving loops around shoulder, elbow, wrist, hip, knee and ankle;
- garment weights copied only as a starting point, then manually corrected.

Validation poses must include:

- arms overhead;
- crossed arms;
- deep elbow bend;
- deep knee bend;
- seated hip flexion;
- torso twist;
- shoulder forward/back;
- extreme head turn;
- wrist flexion;
- locomotion stride.

A garment that passes only the bind pose is not accepted.

## 7. Morph architecture

Saved character parameters are semantic. A single parameter may drive several raw blendshapes.

Primary body targets should use stable semantic names, for example:

- `body_height`
- `body_mass`
- `body_muscle`
- `body_shoulder_width`
- `body_torso_length`
- `body_waist`
- `body_hip_width`
- `body_leg_length`

Primary face targets may include:

- `face_jaw_width`
- `face_chin_length`
- `face_cheek_volume`
- `face_eye_size`
- `face_eye_spacing`
- `face_nose_width`
- `face_nose_length`
- `face_lip_fullness`
- `face_mouth_width`

Correctives are not exposed directly in the UI:

```text
corr__shoulder_width__arm_raise
corr__body_mass__hip_flex
corr__waist__torso_twist
```

Garment fit shapes:

```text
fit__body_mass
fit__shoulder_width
fit__waist
fit__hip_width
```

Do not rely on runtime cage deformation for basic clothing fit. The final garment library needs authored fit/corrective behavior.

## 8. Body-region coverage

Clothing/body masking uses the canonical regions from the V2 manifest schema.

Optional DCC vertex groups mirror those names:

```text
coverage__chest
coverage__abdomen
coverage__pelvis
coverage__upperArmL
...
```

The export/build step converts authoring coverage metadata into the final asset manifest or body mask texture.

Coverage is used to suppress hidden body geometry and reduce clipping/overdraw. It is not a substitute for properly fitting the garment.

## 9. Geometry tiers

LOD targets are visual/deformation targets, not automatic percentage reductions.

### LOD0

- close creator framing;
- full important morph set;
- highest silhouette fidelity;
- clean facial deformation;
- production hair-card silhouette;
- desktop/high-tier target.

### LOD1

- preserve every primary customization parameter that materially affects silhouette;
- preserve face readability;
- reduce invisible/internal garment geometry;
- consolidate materials more aggressively;
- default desktop / strong-mobile tier.

### LOD2

- low-end Android tier;
- preserve the character's identity and major face/body sliders;
- remove secondary edge loops where deformation permits;
- simplify hair layers;
- target minimal material count;
- must still survive animation stress poses.

### Retro

Retro is hand-authored.

- 8k-20k total visible-avatar target;
- deliberate polygon silhouette;
- separate stylized normals/material treatment;
- reduced morph set mapped from the same semantic parameters;
- same character identity and canonical proportions;
- never generated at runtime.

## 10. Material and UV policy

Prioritize draw-call control.

Recommended body breakdown:

- skin/body;
- face specialty only where required;
- eyes;
- mouth/teeth if separate.

Recommended garment target:

- 1 material where possible;
- 2 materials acceptable for meaningful cloth/metal separation;
- >2 requires review for LOD2.

Color variants use masks/uniforms rather than cloned materials.

Dye mask convention:

- R = primary region;
- G = secondary region;
- B = metal/accent region;
- A = authored special-use mask.

Use UDIM/high-resolution source workflows freely in DCC, but browser delivery is packed into the defined runtime texture sets.

## 11. Texture source and bake rules

Keep lossless source/bake textures outside the deployable public tree.

Delivery maps:

- baseColor;
- normal;
- packed ORM where applicable;
- emissive when required;
- alpha/cutout;
- face SDF/light-control;
- dye/customization mask.

Do not bake final cel lighting into base color. The runtime shader owns lighting bands.

For face shading, author a stable light-control/SDF map rather than expecting raw physically based lighting to produce the desired anime face.

## 12. Hair

Hair should be authored as silhouette groups/clumps, not thousands of independent transparent strands.

Performance rules:

- opaque geometry wherever possible;
- alpha/cutout reserved for edges/flyaways;
- sort/transparency complexity minimized;
- directional highlight control available to the hair shader;
- secondary bone chains only for visually important clumps.

LOD2 should reduce hidden inner layers aggressively.

## 13. Secondary motion

Secondary-motion bone names should be grouped predictably:

```text
phys_hair_<group>_01...
phys_cloth_<group>_01...
phys_accessory_<group>_01...
```

Physics roots remain children of canonical deform bones.

Collision authoring uses low-count capsules/spheres associated with canonical bones. Do not export body triangle collision for the web secondary-motion solver.

## 14. First-person readiness

The rig contains or provides an exported helper/socket named `socket_fp_camera`.

Meshes must be separable enough to hide head/eyes/hair from the FP camera without hiding arms/hands.

Do not make the entire body/head one inseparable render primitive if that prevents camera-layer visibility policy.

## 15. Adult-capable body layering

The base-body/anatomy system must preserve seam compatibility and canonical deformation.

Rules:

- all depicted character bodies are adult-coded;
- anatomy modules use the same canonical skeleton/body family;
- clothing uses coverage metadata rather than a disconnected "clothed body";
- underwear is a normal garment layer;
- restricted delivery is resolved server-side;
- asset manifests carry explicit content ratings;
- no runtime inference from suggestive object/material names.

## 16. Staging export

Use glTF 2.0 / GLB as staging/runtime interchange.

Recommended staging exporter configuration:

- export selected objects/collection only;
- skins enabled;
- morph targets enabled;
- normals enabled;
- tangents where required by normal mapping;
- animations disabled for static modular assets;
- cameras/lights disabled;
- no Draco compression;
- avoid irreversible texture conversion in the DCC export;
- keep staging output deterministic.

Meshopt and KTX2 are post-export build stages.

## 17. Pre-delivery validation checklist

Before an asset may enter the build pipeline:

- correct asset ID and naming;
- no unapplied negative scale;
- expected axis/scale;
- required bones present;
- skeleton/reference pose matches;
- <=4 skin influences;
- no unweighted vertices;
- LODs present as required;
- Retro present when declared;
- morph names valid;
- correctives documented;
- material count within class budget;
- no accidental high-resolution source textures embedded;
- body-region coverage authored;
- physics metadata authored if needed;
- content rating assigned;
- provenance/license recorded.

After browser processing:

- glTF validator passes;
- skeleton signature passes;
- Meshopt decode passes;
- KTX2 transcoding passes on target browsers;
- manifest validator passes;
- visual regression passes;
- animation stress pose passes;
- memory acquire/release/eviction test passes.
