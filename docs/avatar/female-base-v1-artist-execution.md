# `female_base_v1` artist execution handoff

Date: 2026-10-24

Baseline: PR #121, `0054dc8a4a5e78e5b813c004702bd1246245baf9`

Verdict: **ARTIST EXECUTION REQUIRED.** No visual candidate was promoted from the automated DCC trial. `female_base_v1` remains `MISSING`.

## Verified authoring source

- Source: Blender Human Base Meshes v1.4.1, `Body Female - Realistic`.
- License: CC0-1.0.
- Official archive: `https://download.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip`.
- Archive bytes: `50,643,039`.
- Archive SHA-256: `811F43ACCBB31A88266D932F8F5563B2D13586FCA0BA2693AAD1F5FE582B3515`.
- DCC used for verification: Blender 4.5.1 LTS.
- Local ignored raw archive: `.cache/avatar-female-v1-candidate-01/human-base-meshes-bundle-v1.4.1.zip`.
- Local ignored untouched source: `.cache/avatar-female-v1-candidate-01/raw-source/human-base-meshes-bundle-v1.4.1/human_base_meshes_bundle.blend`.

The untouched source must remain immutable. Create the editable artist working source at:

`.cache/avatar-female-v1-candidate-01/working-source/female_base_v1_candidate_01_working.blend`

The review derivative must remain separate:

`.cache/avatar-female-v1-candidate-01/review-derivative/female_base_v1_candidate_01_review.glb`

Neither binary belongs under `public/` or in the production registry before storage policy and owner review are satisfied.

The reversible workspace is prepared with:

- `scripts/avatar/prepare-female-base-v1-workspace.py` for source duplication, fixed stage setup, checkpoint notes, and the immutable `v000` baseline;
- `scripts/avatar/render-female-base-v1-review.py` for versioned, fixed-camera evidence and metadata;
- `docs/avatar/female-base-v1-sculpt-priority-guide.md` for region-level sculpt priorities and measurable checkpoint exits.

Prepare the ignored local working source from the verified bundle:

```powershell
blender --background --factory-startup --python scripts/avatar/prepare-female-base-v1-workspace.py -- --source .cache/avatar-female-v1-candidate-01/raw-source/human-base-meshes-bundle-v1.4.1/human_base_meshes_bundle.blend --output .cache/avatar-female-v1-candidate-01/working-source/female_base_v1_candidate_01_working.blend --baseline-output .cache/avatar-female-v1-candidate-01/working-source/versions/female_base_v1_candidate_01_v000.blend
```

The resulting file contains a locked hidden `RAW_CC0_REFERENCE`, one editable body in `FEMALE_BASE_V1_CANDIDATE_01`, embedded checkpoint notes A–E, neutral review materials and lighting, and fixed review cameras. Separate source eye specimens remain reference-only because the final eye system is explicitly downstream of visual-direction approval.

After saving a versioned artist revision, generate deterministic evidence with:

```powershell
blender .cache/avatar-female-v1-candidate-01/working-source/versions/female_base_v1_candidate_01_v001.blend --background --python scripts/avatar/render-female-base-v1-review.py -- --output-root .cache/avatar-female-v1-candidate-01/review --revision v001 --notes "Checkpoint reached and sculpt changes"
```

The generated `metadata.json` carries the working-source checksum, DCC version, topology counts, registry/review state, camera records, and missing range-state status. Review output remains ignored local evidence until a qualified sculpt exists.

## Source facts

- Body object: `GEO-body_female_realistic`.
- Base topology: 10,582 vertices, 10,590 faces (10,570 quads and 20 triangles), 21,170 edges; 21,160 evaluated base triangles before separate eye specimens.
- Raw body-and-eyes review export: approximately 22,248 triangles.
- Existing modifier: Multires.
- No canonical rig, production morphs, semantic production materials, or animation clips.
- The anatomy is a useful neutral foundation, but its face and silhouette are generic realistic-human source material rather than Otaku-mori visual authority.

## Automated DCC assessment

A non-destructive coordinate-region trial tested proportion, jaw, chin, eye, nose, cheek, mouth, neck, shoulder, and hip changes while preserving the untouched source.

The trial was rejected before owner review because:

- the face still read as a generic mannequin rather than premium anime-stylized realism;
- eyelids and orbital anatomy require deliberate sculpting, not broad procedural scaling;
- the nose, mouth corners, philtrum, jaw, and chin need authored surface transitions;
- the source density and automated smoothing produced visible faceting in the review result;
- hands and feet remained source-quality rather than flagship-quality;
- the result did not justify the identifier `female_base_v1_candidate_01`.

No automated result was registered, committed, or treated as a candidate.

## Required sculpt pass

### 1. Protect source structure

- Link or duplicate the untouched `Body Female - Realistic` collection into a new working file.
- Preserve the original Multires source in a hidden `RAW_CC0_REFERENCE` collection.
- Work on a separate `FEMALE_BASE_V1_CANDIDATE_01` collection.
- Keep symmetry enabled through initial silhouette approval.
- Preserve a reversible modifier/sculpt stack where practical.

### 2. Adult silhouette and proportion

- Target 7.2–7.5 heads tall without simply enlarging the head.
- Establish a compact-to-average adult frame with slightly elongated, credible limbs.
- Rebalance the source's hip/thigh dominance against the shoulder and clavicle structure.
- Preserve a natural ribcage, subtle waist, credible pelvis, neutral chest, and grounded A-pose.
- Keep enough neutral volume for later Petite, Soft/Curvy, Athletic, and Strong bodies.

### 3. Face direction

- Sculpt an attractive neutral face that survives front, 3/4, and profile inspection.
- Create a softly tapered adult lower face with visible cheekbone planes.
- Build a defined, non-severe jaw and enough chin projection to avoid a recessed profile.
- Increase eye readability only modestly; retain real orbital placement, sclera coverage, and clean upper/lower lids.
- Refine the nose into a narrower anime-directed form while preserving bridge, alar, nostril, and tip geometry.
- Shape the lips with clear upper-lip form, natural lower-lip volume, restrained projection, and deliberate corners.
- Preserve real ears, skull volume, neck insertion, and jaw-to-neck transition.

### 4. Hard anatomy gates

- Rework palm/finger proportions, thumb placement, knuckles, and relaxed hand gesture.
- Rework heel, arch, toe box, toe spacing, and ankle transition.
- Correct shoulder elevation flow, deltoid insertion, underarm volume, elbow landmarks, and clavicle continuity.
- Correct sternum, chest attachment, hip/thigh transition, patella, calf, and ankle landmarks.
- Reject any permanent lumbar arch, hip pop, compressed cleavage, or baked sexualized extreme.

### 5. Topology strategy

- Preserve deformation-ready loops and stable vertex order wherever the source remains suitable.
- Add density selectively to eyelids, lips, nose, nasolabial region, jaw, ears, hands, and feet.
- Do not blindly subdivide the whole body.
- Final body-plus-head target remains 35k–60k triangles after visual approval and cleanup.
- No non-manifold geometry, redundant shells, or destructive remesh without an intentional retopology plan.

### 6. Review-only range states

Create reversible review states named clearly as non-production demonstrations:

- `OM_REVIEW_Default`
- `OM_REVIEW_Petite`
- `OM_REVIEW_Soft_Curvy`
- `OM_REVIEW_Athletic_Strong`

These states demonstrate envelope viability only. They are not the final `om_body_*` morph set.

### 7. Review materials

- Use neutral semantic placeholders for `skin` and `eyes`.
- Add only the minimum iris, brow, and lash treatment needed for honest facial judgment.
- Avoid beauty filters, makeup, tattoos, dramatic subsurface scattering, gloss, bloom, fog, or colored wash.
- Use bald/scalp presentation unless a clearly labeled review-only hair proxy improves skull judgment without hiding anatomy.

## Owner-review render packet

Use one camera family, one neutral scale, and canonical Creator-stage lighting: soft warm-neutral key, restrained neutral fill, subtle rim, charcoal background, no bloom.

Required views:

1. Full body front.
2. Full body 3/4 left.
3. Full body profile.
4. Full body back.
5. Full body slight low angle.
6. Full body slight high angle.
7. Face front close.
8. Face 3/4 close.
9. Face profile close.
10. Face slight high.
11. Face slight low.
12. Hands detail.
13. Feet detail.
14. Shoulder/clavicle/neck detail.
15. Hip/thigh/knee detail.
16. Default range state.
17. Petite approximation.
18. Soft/Curvy approximation.
19. Athletic/Strong approximation.

Every capture must identify:

- review ID `female_base_v1_candidate_01`;
- source and source SHA-256;
- state `CANDIDATE_FOR_OWNER_REVIEW`;
- working-source filename;
- working-source and review-derivative checksums;
- triangle and vertex counts;
- viewport, camera, quality tier, DCC version, and active review state;
- concise list of modifications performed.

The render script records absent review range states as `MISSING` and cannot promote review or registry state. Artists must not change `review_state` from `ARTIST_WORKING_SOURCE` to `CANDIDATE_FOR_OWNER_REVIEW` until checkpoints A–D meet the guide's exit criteria.

## Promotion boundary

Owner response is limited to `APPROVE DIRECTION`, `REVISE`, or `REJECT`.

Until explicit `APPROVE DIRECTION`:

- production registry `female_base_v1` remains `MISSING`;
- no `om-humanoid-v1` production rigging;
- no final production morph set;
- no semantic production material authoring;
- no `medium_wolf_01`;
- no `commander_combat_01`;
- no runtime integration.
