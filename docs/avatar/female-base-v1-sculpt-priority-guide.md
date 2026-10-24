# `female_base_v1_candidate_01` sculpt priority guide

This guide applies to the verified Blender Human Base Meshes v1.4.1 CC0 object `GEO-body_female_realistic`. It supplements, rather than replaces, `female-base-v1-artist-execution.md`. The untouched source and hidden `RAW_CC0_REFERENCE` collection remain immutable.

## Stylization strategy

The 60–65% anime-directed result must come from coordinated orbital shape, authored eyelids, lower-face taper, cheek planes, dimensional nose and mouth forms, adult silhouette, and later material direction. Eye enlargement alone is not an acceptable stylization strategy. Every facial decision must survive front, three-quarter, and profile cameras.

## Face priorities

| Region | Priority | Source-specific direction |
| --- | --- | --- |
| Orbital shape | MUST CHANGE | Establish a cleaner anime-directed orbital rhythm without flattening the brow or pushing the eyeballs forward. |
| Eyelids | MUST CHANGE | Author distinct upper/lower lid thickness and corners; eliminate mannequin-like surface transitions. |
| Eye projection | MUST CHANGE | Keep eyeballs seated in the orbit and readable in profile; use only a modest scale change. |
| Cheekbone plane | MUST CHANGE | Create deliberate front-to-side planes supporting a softly tapered adult face. |
| Nose bridge | MUST CHANGE | Narrow/refine while preserving real bridge depth from brow to tip. |
| Nose tip | MUST CHANGE | Create intentional tip projection and transition into the columella. |
| Alar/nostril form | MUST CHANGE | Define alar wings and nostrils as geometry, not a texture-only suggestion. |
| Philtrum | MUST CHANGE | Establish a readable but restrained philtrum between nose and upper lip. |
| Upper lip | MUST CHANGE | Shape cupid's bow and upper-lip plane without a permanent pout. |
| Lower-lip projection | MUST CHANGE | Add controlled volume and a clean transition into the chin. |
| Mouth corners | MUST CHANGE | Author corners and neutral tension; avoid a line mouth or fixed expression. |
| Jaw angle | MUST CHANGE | Define a feminine, credible mandibular turn without filler-like width or a needle chin. |
| Chin projection | MUST CHANGE | Ensure enough forward volume to remain attractive and adult in profile. |
| Side-profile depth | MUST CHANGE | Balance brow, nose, lips, and chin as one silhouette before secondary detail. |
| Skull silhouette | LIKELY CHANGE | Refine only as needed to support the approved face proportions and scalp line. |
| Ears | PRESERVE IF GOOD | Preserve credible placement and structure unless profile review exposes a mismatch. |

## Body priorities

| Region | Priority | Source-specific direction |
| --- | --- | --- |
| Neck-to-shoulder transition | MUST CHANGE | Remove the generic mannequin transition; establish adult neck insertion and trapezius flow. |
| Clavicle | MUST CHANGE | Make the clavicle readable under neutral lighting without carving a hard groove. |
| Deltoid/upper arm | MUST CHANGE | Clarify deltoid cap, underarm, and upper-arm transition for an elevated A-pose. |
| Hand proportions | MUST CHANGE | Correct palm/finger relationships, thumb placement, knuckles, and relaxed gesture. |
| Foot structure | MUST CHANGE | Establish heel, arch, toe box, toe spacing, and credible ankle transition. |
| Ribcage | LIKELY CHANGE | Refine the thoracic mass to support a balanced adult default and later range states. |
| Waist | LIKELY CHANGE | Keep a readable but non-extreme waist with credible ribcage-to-pelvis continuity. |
| Iliac/pelvis transition | LIKELY CHANGE | Reconcile pelvis landmarks and hip width without baking a curvy extreme. |
| Glute/upper-thigh relationship | LIKELY CHANGE | Reduce generic source dominance and preserve clean side/back silhouettes. |
| Knee structure | LIKELY CHANGE | Clarify patella and surrounding planes for front/profile readability. |
| Ankle | LIKELY CHANGE | Preserve bony landmarks and avoid a pinched ankle above the revised foot. |
| Elbow | LIKELY CHANGE | Refine landmarks only after shoulder and arm proportions are stable. |
| Neutral A-pose | PRESERVE IF GOOD | Keep the restrained pose and symmetry while primary proportions are approved. |
| Major limb length | PRESERVE IF GOOD | Change only if the 7.2–7.5-head silhouette review demonstrates a mismatch. |

## Checkpoint exits

- **A — Silhouette:** unmistakably adult; 7.2–7.5 heads tall; coherent shoulder, ribcage, waist, pelvis, limbs, and hand/foot scale in all full-body cameras.
- **B — Face primary forms:** skull, orbits, cheek planes, jaw, chin, nose, mouth placement, and profile read as one intentional premium character direction.
- **C — Face secondary forms:** lids, brow transition, alar/nostril forms, philtrum, lips, corners, and cheek transitions withstand all face cameras without dramatic lighting.
- **D — Body anatomy polish:** clavicle, shoulders, elbows, hands, pelvis, knees, ankles, and feet contain no obvious flagship-quality defect.
- **E — Owner review candidate:** A–D are internally accepted; four review range states exist; all fixed-camera renders use the same neutral stage. This checkpoint permits a review packet, not registry promotion.

## Version and capture rules

- Preserve the generated `v000` baseline and save manual revisions as `female_base_v1_candidate_01_v001.blend`, `v002`, and so on.
- Never overwrite the only sculpt revision.
- Do not move or unlock the fixed `OM_REVIEW_*` cameras between revisions. Left and right hands use separate fixed detail cameras so torso framing cannot hide either hand.
- Use `scripts/avatar/render-female-base-v1-review.py` to produce versioned evidence and metadata.
- Missing review range states must remain visibly `MISSING`; do not substitute another shape or pose.
