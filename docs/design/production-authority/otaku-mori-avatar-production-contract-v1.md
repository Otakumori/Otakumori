# Otaku-mori Avatar Production Contract v1

Status: **Owner-side production authority draft**

Purpose: define the canonical asset, rig, runtime, performance, persistence, and visual requirements for the Tier-0 Otaku-mori Avatar Creator before Codex reaches Avatar Production Closure.

## Executive authority

The Avatar Creator is Tier-0. It is not launch-ready because a config can be saved or a GLB can be generated.

Launch approval requires:
- FUNCTION — controls reliably change the visible character.
- VISUAL — character quality meets Otaku-mori's stylized-realism bar.
- ASSETS — no launch-visible placeholder bodies, faces, hair, clothing, or accessories.
- INTERACTION — camera, selection, morphing, color, animation, save/load feel immediate and deliberate.
- RESPONSIVE — desktop, tablet, and mobile deliberately recompose.
- PERFORMANCE — model, textures, draw calls, memory, animation, and physics remain within route-specific budgets.
- ACCESSIBILITY — semantic keyboard/touch alternatives exist for direct 3D manipulation.
- PERSISTENCE — save/load round-trips without silently replacing user choices with defaults.
- INTEGRATION — Commander and supported games consume the same canonical identity.
- FAILURE — missing assets, failed loads, unsupported configs, and export failures fail honestly.
- OWNER REVIEW — final visual presentation is explicitly approved.

Intermediate classifications:
- `AVATAR SYSTEM READY — ASSET PRODUCTION REMAINS`
- `AVATAR TECHNICALLY READY — OWNER VISUAL REVIEW REQUIRED`

Final launch classification:
- `AVATAR CREATOR PRODUCTION READY`

## Current repository reality

The repo already contains substantial 3D-avatar infrastructure:
- `AvatarConfiguration`, `AvatarConfigurationPart`, `AvatarMorphTarget`, `AvatarMaterialOverride`.
- Character-config bridge.
- GLB generation/export.
- Blob export and Inngest background generation.
- Part/morph/material vocabulary.
- Three.js / React Three Fiber dependencies.
- 3D asset optimization script.

But the visible `app/components/profile/AvatarCreator.tsx` remains a placeholder 2D SVG demo using a few colors, short/long hair, localStorage, and generic pink styling.

This is a convergence problem, not greenfield work.

Known authority gaps:
- Placeholder SVG creator must not remain launch-visible.
- Signed-in persistence must use canonical database configuration.
- Creator → database → reload → creator must preserve complete user state.
- Mock/TODO FBX/OBJ/PNG/JPG/SVG exports must not be presented as real.
- Optimization tooling must not claim KTX2, LOD, validation, or simplification unless implemented and verified.
- Code-referenced GLB paths are not automatically production assets.
- Age/NSFW state must use site-level canonical authority.

### Dependency compatibility warning

Current package state declares React 18 with `@react-three/fiber` 9.x. Current R3F documentation pairs v9 with React 19; v8 is the React 18 line. Do not silently upgrade/downgrade during unrelated work. Avatar Production Closure should explicitly prove and resolve the supported pairing before final certification.

## Visual north star

Target: **high-fidelity anime-proportioned realism for a dark contemporary fantasy RPG world.**

Quality direction:
- modern anime action-RPG creator;
- Code Vein / Nikke-adjacent quality expectations without copying proprietary assets;
- more anatomically convincing than chibi/cel-cartoon avatars;
- more stylized than photogrammetry;
- compatible with charcoal → bronze → restrained sakura.

Avoid:
- mismatched VRChat-like asset packs;
- generic Ready Player Me look;
- plastic skin;
- photoreal pores on heavily anime geometry;
- chibi proportions;
- random cosplay clutter;
- arbitrary horns/tails;
- excessive glow/VFX;
- generic pink creator UI;
- placeholder primitives.

## Canonical runtime format

Primary runtime/export authority:
- glTF 2.0 / GLB.

Preferred production pipeline:
- DCC source masters in Blender or equivalent.
- glTF Transform or equivalent reproducible optimization.
- Meshopt for geometry/morph/animation compression where validated.
- KTX2/Basis for GPU texture compression where appropriate.
- GLTFLoader + MeshoptDecoder + KTX2Loader at runtime.

FBX is not the web runtime format.

## Base character contract

### Launch bodies
Minimum:
- one production female base;
- one production male base;
- compatible humanoid skeleton;
- shared semantic morph vocabulary;
- identical world scale/root convention;
- clothing compatible with the same rig contract.

Two excellent configurable bases are preferable to many inconsistent bodies.

### Proportions
Target:
- contemporary anime-realistic adult proportions;
- roughly 1:7–1:7.5 head-to-height depending on final style;
- believable hands, feet, shoulders, pelvis, knees, elbows;
- neutral enough for slim, average, soft/curvy, athletic, muscular ranges;
- extreme morphs kept within safe deformation limits.

### Topology
Required:
- clean deformation loops around shoulders, elbows, wrists, hips, knees, ankles, neck, jaw, mouth, eyes, nose, brows;
- facial density sufficient for expression without excessive body density;
- consistent vertex order where shared morphs require it;
- no non-manifold launch geometry;
- no accidental transforms or scale;
- no unnecessary hidden shells;
- no embedded cameras/lights unless deliberately authored.

Suggested review budgets:
- body + head: ~35k–60k triangles;
- hair: ~8k–25k;
- outfit: ~15k–45k;
- accessories: ~2k–12k aggregate typical;
- ordinary equipped avatar: ~65k–120k;
- mandatory review above ~150k.

These are review budgets, not blind rejection thresholds.

## Skeleton authority

Stable semantic humanoid skeleton:
- `root`
- `pelvis`
- `spine_01`
- `spine_02`
- `chest`
- `neck`
- `head`
- `clavicle_l/r`
- `upperarm_l/r`
- `lowerarm_l/r`
- `hand_l/r`
- finger chains as required
- `thigh_l/r`
- `calf_l/r`
- `foot_l/r`
- `toe_l/r`

Optional authored chains:
- hair;
- coat/skirt;
- selected accessories.

Rules:
- freeze bone names before production clothing scales up;
- all modular clothing targets the canonical skeleton;
- no asset-specific humanoid skeleton forks;
- no arbitrary scale differences between bases;
- root transform convention stays stable;
- animation retargeting must remain deterministic.

## Morph authority

Stable semantic names.

### Face
- `face_width`
- `face_depth`
- `jaw_width`
- `jaw_angle`
- `chin_width`
- `chin_length`
- `chin_projection`
- `cheekbone_width`
- `cheek_fullness`
- `forehead_height`
- `eyes_size`
- `eyes_spacing`
- `eyes_depth`
- `eyes_tilt`
- `eyes_upper_shape`
- `eyes_lower_shape`
- `nose_width`
- `nose_length`
- `nose_bridge_width`
- `nose_bridge_depth`
- `nose_tip_projection`
- `nose_tip_width`
- `mouth_width`
- `mouth_projection`
- `lips_upper_fullness`
- `lips_lower_fullness`
- `mouth_corner_rest`
- `ears_size`
- `ears_angle`

### Body
- `body_height`
- `body_frame`
- `body_softness`
- `body_muscularity`
- `shoulders_width`
- `chest_width`
- `torso_depth`
- `waist_width`
- `hips_width`
- `hips_depth`
- `arms_length`
- `arms_volume`
- `legs_length`
- `thigh_volume`
- `calf_volume`

Rules:
- clamp to authored safe bounds;
- validate single extremes and dangerous combinations;
- clothing must support the declared morph envelope;
- GLB target names must match the app contract;
- persistence stores semantic values, not index positions.

## Materials

### Skin
- clean stylized material response;
- base color + normal + roughness/ORM as justified;
- 2k High only where needed;
- 1k Balanced;
- 512–1k Low;
- avoid wax/plastic or photographic micro-noise.

### Eyes
Prefer:
- separate iris/sclera/cornea where performant;
- controlled cornea/specular response;
- authored iris families with broad recoloring.
Launch target: 4–6 strong iris styles.

### Hair
Prioritize silhouette and anime massing.
- geometry-driven primary masses;
- limited alpha cards;
- controlled anisotropic/specular response where performant;
- optional secondary bones for selected styles.

Launch target:
1. long layered
2. long straight
3. medium wolf/shag
4. bob
5. short textured
6. ponytail
7. updo
8. asymmetric alt signature

### Clothing
Curated dark contemporary alt + anime-fantasy utility.

Launch target:
- 3 tops;
- 3 bottoms;
- 2–3 full outfits;
- 3 shoes;
- 6–10 small accessories.

Suggested first wardrobe:
- fitted black high-neck top
- structured cropped jacket
- dark soft blouse/knit
- high-waist fitted trouser
- asymmetric skirt
- utility skirt/short
- restrained gothic dress
- commander combat-tailored set
- urban fantasy set
- platform boot
- sleek combat boot
- minimal low boot

No tassels by default.

### Tattoos / markings
Prefer mask/decal or overlay strategy.
Persist semantic asset ID + placement parameters.
Avoid baking a new body texture for every tattoo.

## Modular attachment contract

Every asset needs:
- stable asset ID;
- compatible base list;
- skeleton version;
- slot;
- conflicts;
- hidden-body regions;
- morph compatibility;
- material slots;
- physics requirements;
- LOD availability;
- bounds/camera metadata;
- content rating.

Recommended slots:
- `hair`
- `top`
- `bottom`
- `outfit`
- `shoes`
- `head_accessory`
- `ear_accessory`
- `neck_accessory`
- `hand_accessory`
- `face_accessory`
- `body_marking`

## Clothing intersection strategy

Preferred order:
1. author for canonical body/morph envelope;
2. garment morphs follow body morph values;
3. body hiding masks for covered regions;
4. conservative runtime correction only if necessary.

Avoid per-frame clipping hacks.

## Runtime architecture

Recommended ownership:
`AvatarConfig`
→ `AvatarResolver`
→ `AssetManifest`
→ `AvatarScene`
→ `MorphController`
→ `MaterialController`
→ `WardrobeController`
→ `AnimationController`
→ `QualityController`

UI modifies semantic config.
Renderer consumes resolved config.

Do not put Three.js object references into persistence/business state.

## Persistence contract

Canonical signed-in state must preserve:
- config version;
- base model;
- selected asset IDs;
- identity morphs;
- material/colors;
- tattoos/marks;
- outfit/accessories;
- expression/default pose if user-controlled;
- quality-independent identity.

Do not persist:
- transient camera state;
- renderer quality as identity;
- mesh indices;
- Three.js UUIDs.

Mandatory proof:
CREATE → SAVE → HARD RELOAD → LOAD → visually equivalent → SAVE AGAIN → no drift.

## Commander integration

Commander must consume the same canonical avatar:
- creator saves;
- Commander reads the saved identity;
- Commander may use a cheaper camera/render tier;
- Edit returns to exact saved config;
- reset/delete is predictable;
- failed 3D load has authored fallback.

## Camera

Modes:
- `FULL_BODY`
- `UPPER_BODY`
- `FACE`
- `DETAIL`

Camera follows editing context.
Transitions are bounded, interruptible, reduced-motion aware.

Desktop: 3D stage is primary, controls alongside.
Mobile: keep the character prominent; controls use bottom-sheet/tabbed drawer.

## Lighting

Authored creator rig:
- soft key;
- restrained fill;
- subtle rim/separation;
- neutral/warm environment;
- charcoal environment;
- minimal sakura accent.

Avoid neon wash, heavy bloom, or lighting that hides bad materials.

## Physics

Use selectively for:
- long hair;
- ponytails;
- selected cloth appendages;
- selected accessories.

Requirements:
- stable initialization;
- no permanent clipping;
- survives tab sleep/wake;
- quality tiers may reduce/disable secondary motion;
- fine-edit mode may pause secondary motion.

## Performance budgets

### High
- target 60 FPS on capable desktop;
- full selected physics;
- up to 2k critical textures;
- authored shadows.

### Balanced
- target 45–60 FPS on representative modern phone;
- 1k most textures;
- reduced shadow/physics cost.

### Low
- target >=30 FPS on lower-end supported hardware;
- simplified shadows;
- 512–1k textures;
- secondary physics reduced/disabled.

Review targets for a typical equipped avatar:
- initial compressed avatar package target <= 12–18 MB;
- visible draw calls aim <= 70, review above 100;
- visible unique materials aim <= 20–30, review above 35;
- active skinned meshes minimized;
- no resource growth after repeated swaps.

Current 50 MB export warning must not become a runtime target.

## LOD policy

LOD0: creator close inspection.
LOD1: Commander/full-body normal view.
LOD2: distant/game/social representation where applicable.

Validate every LOD for:
- rigging;
- morph behavior;
- UVs;
- materials;
- animation;
- silhouette.

Do not blindly simplify skinned/morphed meshes.

## Export policy

Launch-required only if intentionally exposed:
- GLB.

Not launch-approved until actually implemented:
- FBX
- OBJ
- PNG
- JPG
- SVG

No mock files.

## Failure states

Author:
- base load failure;
- optional asset failure;
- incompatible garment;
- unsupported morph combo;
- save failure;
- load failure;
- export failure;
- WebGL unavailable;
- quality downgrade;
- asset-version mismatch.

Never silently replace a user's saved choice.

## Accessibility

Every operation must work without dragging the scene:
- semantic tabs;
- labeled sliders;
- keyboard;
- reset per section/control;
- non-color labels for color choices;
- reduced motion;
- focus management;
- save/load announcements.

## First production asset roster

Base:
- `female_base_v1`
- `male_base_v1`

Hair:
- `long_layered_01`
- `long_straight_01`
- `medium_wolf_01`
- `bob_01`
- `short_texture_01`
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

Full outfits:
- `gothic_dress_01`
- `commander_combat_01`
- `urban_fantasy_01`

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

Keep the initial library curated.

## Asset registry states

- `MISSING`
- `CONCEPT`
- `CANDIDATE`
- `OWNER APPROVED`
- `RUNTIME READY`
- `INTEGRATED`
- `QA PASSED`

Each asset records:
ID, family, owning surface, purpose, source master, author/license, checksum, runtime path, skeleton version, compatible bodies, slot/conflicts, triangles, vertices, bones, materials, textures, compression, LODs, physics, morph-safety, QA, approval.

## Visual QA

Base:
- front
- 3/4
- profile
- back
- face close
- full body
- neutral + expressive pose

Hair:
- front
- side
- back
- motion-rest state
- compatibility with face/head morph envelope

Garment:
- narrow
- default
- wide/curvy
- athletic
- arms raised
- seated/crouched where game use requires

Creator:
- desktop
- tablet
- mobile portrait
- relevant mobile landscape
- High/Balanced/Low
- repeated swaps
- save/reload
- route exit/re-entry

## Owner rejection criteria

Immediate rejection:
- generic game-avatar look;
- visibly primitive anatomy;
- poor hands/feet/shoulders;
- hair reads as helmet;
- uncanny/lifeless face;
- plastic skin;
- routine clothing clipping;
- excessive bloom/emissive;
- generic pastel/pink UI;
- model looks good only from one angle;
- mobile preview too small to judge;
- inconsistent style across assets;
- placeholder promoted as launch-ready.

## Codex Avatar Closure entry criteria

When Avatar Production Closure begins, Codex must first produce:
1. exact avatar route/entry points;
2. real asset inventory;
3. actual persistence round-trip;
4. renderer/runtime path;
5. dependency compatibility state;
6. asset gaps;
7. code-solvable gaps;
8. smallest safe convergence branch.

It must not immediately rewrite the avatar system.

The first implementation should converge existing infrastructure into one authoritative creator, not create a third avatar architecture.

## Owner-side next work

Before Codex reaches Avatar Closure:
1. approve base-body visual direction;
2. approve male/female silhouette ranges;
3. freeze skeleton naming;
4. freeze launch morph inventory;
5. choose first 8 hair silhouettes;
6. choose launch wardrobe;
7. procure/create production base meshes;
8. validate licenses;
9. produce first GLB proof;
10. prove one full vertical slice:

base body → morph → hair → outfit → save → reload → Commander.

That vertical slice is the highest-value proof before scaling the asset library.