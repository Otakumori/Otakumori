# Avatar V2 Asset Procurement Ledger

Verified: 2026-10-07

This ledger separates **production-authoring sources** from **runtime test/proxy assets**. A permissive license does not make an asset visually canonical. Otaku-mori's final character identity remains bespoke.

## Procurement policy

Every external asset entering the avatar pipeline must record:

- title and author/publisher;
- exact source URL;
- exact license/SPDX identifier;
- acquisition date;
- source archive SHA-256 where possible;
- whether redistribution is permitted;
- whether the asset is production-authoring source, development fixture, Retro proxy, or reference-only;
- modifications performed;
- final derived-asset SHA-256.

Do not commit marketplace/vendor source archives merely because the runtime may legally ship a derived asset. Preserve the original license/terms snapshot in project records.

## Approved source classes

### 1. Blender Human Base Meshes v1.4.1

**Status:** APPROVED as production-authoring base/reference.

- Publisher: Blender Studio / community.
- Official distribution: https://www.blender.org/download/demo-files/
- Direct v1.4.1 archive: https://download.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip
- License: CC0-1.0.
- Published bundle includes realistic and stylized male/female human bases and related body-part/head assets.
- Blender's official page identifies Human Base Meshes v1.4.1 as CC0.

**Use in Otaku-mori:** Use the adult-coded stylized/realistic body assets as sculpting/topology reference and optional starting source for the bespoke canonical body. Do not ship an untouched Blender base as the final character.

**Required work before production:** art-direction sculpt, topology review, UV strategy, canonical OM_Humanoid_v1 rig, weights, face topology, morph library, corrective shapes, custom normals, custom materials, LODs.

### 2. Quaternius Universal Base Characters

**Status:** APPROVED for development fixtures, retarget tests, and candidate Retro/proxy work. NOT the HQ visual authority.

- Publisher: Quaternius.
- Official page: https://quaternius.com/packs/universalbasecharacters.html
- Distribution: https://quaternius.itch.io/universal-base-characters
- License: CC0-1.0.
- Free Standard archive listed by the publisher: `Universal Base Characters[Standard].zip`.
- Standard package size shown by itch.io: 122 MB.
- Publisher states six game-ready bases, humanoid rig, 20 hairstyles, and approximately 13k triangles average.

**Adult-project restriction:** the pack includes "Teen" proportion variants. They are **excluded** from this project's adult-capable creator, adult testing, adult screenshots, and adult-derived assets. Only clearly adult-coded Regular/Superhero bases may be used as technical fixtures.

**Use in Otaku-mori:** loader tests, skeleton-retarget tests, modular hair experiments, low-poly/Retro proof, mobile baseline. If used as a shipped Retro derivative, record the exact source model and conversion.

### 3. Quaternius Modular Character Outfits - Fantasy

**Status:** APPROVED for modular-garment pipeline proof. NOT final Mori fashion authority.

- Official distribution: https://quaternius.itch.io/modular-character-outfits-fantasy
- License: CC0-1.0.
- Publisher lists 12 outfits / 62 modular parts and compatibility with Universal Base Character heads/rig.

**Use in Otaku-mori:** validate slot manifests, clothing rebinding, coverage masks, atlas processing, LOD delivery and cache churn. Final Otaku-mori wardrobe should be custom-authored to the Mori art direction.

### 4. Poly Haven

**Status:** APPROVED for production environment lighting/reference textures.

- Official license: https://polyhaven.com/license
- License: CC0-1.0.
- Poly Haven explicitly permits commercial use and redistribution of its asset files.

**Use in Otaku-mori:** neutral creator HDRI/environment experiments and physically based reference maps. Final creator lighting should still be authored for the cel shader rather than depending on HDRI aesthetics.

### 5. ambientCG

**Status:** APPROVED for production/reference material inputs.

- Official site: https://ambientcg.com/
- License: CC0-1.0.

**Use in Otaku-mori:** cloth/leather/metal surface references and source maps that are transformed into Mori material families. Do not expose raw photoreal PBR as the final anime look.

### 6. Khronos glTF Sample Assets / RiggedSimple

**Status:** APPROVED as automated loader/skinning fixture only.

- Repository: https://github.com/KhronosGroup/glTF-Sample-Assets
- RiggedSimple: `Models/RiggedSimple`
- License for RiggedSimple: CC-BY-4.0, © 2017 Cesium.
- Raw GLB used by the fetch helper:
  https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/RiggedSimple/glTF-Binary/RiggedSimple.glb

**Use in Otaku-mori:** CI/dev verification that skinning/animation GLBs load. It is not an art asset.

**Attribution requirement:** preserve Cesium attribution if the fixture is redistributed.

### 7. Adobe Mixamo

**Status:** LOCAL/PIPELINE USE ONLY unless a specific redistribution review is completed.

- Official FAQ: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html
- Adobe states characters and animations can be used royalty-free in personal, commercial and nonprofit projects including video games.

**Use in Otaku-mori:** temporary retargeting/animation experiments if useful.

**Repository rule:** do not commit raw Mixamo character/animation files into the public repository by default. The canonical production animation library should preferably be authored or sourced from assets with unambiguous redistribution terms.

## Custom-only assets

The following should not be "solved" by random asset aggregation:

- final HQ feminine canonical body;
- final HQ masculine canonical body / Sol;
- production face topology and morph set;
- custom face SDF/light-control maps;
- final hair silhouettes;
- adult anatomy modules;
- production underwear/base garments;
- signature Mori outfits;
- final cel-shader material calibration;
- production LODs and Retro derivatives of the approved body.

The reason is technical as much as aesthetic. These assets must share topology conventions, the OM_Humanoid_v1 bind contract, morph semantics, coverage masks, normals, UV/material conventions and corrective deformation.

## Recommended first procurement batch

1. Download Blender Human Base Meshes v1.4.1 into local source-art storage.
2. Download Quaternius Universal Base Characters Standard and preserve the archive hash/license record.
3. Download Quaternius Modular Character Outfits Fantasy Standard and preserve the archive hash/license record.
4. Fetch Khronos RiggedSimple through the repository helper for automated loader tests.
5. Select one neutral Poly Haven studio-like HDRI after renderer lighting tests; record exact asset ID before committing/hosting it.
6. Select only the ambientCG source maps that are actually transformed into production material families.

## Repository placement

Never place raw DCC/vendor source zips under `public/`.

Recommended local/art storage:

```text
.cache/avatar-source/       # automated temporary open fixtures, gitignored
art-source/avatar-v2/       # artist workstation / external art storage, not git
public/avatar/v2/           # deployable optimized runtime artifacts only
docs/avatar/licenses/       # text provenance/license records
```

Large production binaries should use the project's object-storage/CDN policy rather than normal Git history.

## Final-asset acceptance

A procured or custom asset cannot become production-active until it has:

- a passing V2 manifest;
- canonical rig/body-family compatibility;
- explicit content rating;
- LOD2 at minimum;
- measured triangle and draw-call counts;
- texture codec classification;
- provenance/license record;
- body coverage/attachment metadata where applicable;
- no unresolved clipping in the required morph envelope;
- successful acquire/prewarm/equip/release/evict cycle;
- a visual approval pass against the Mori character art direction.
