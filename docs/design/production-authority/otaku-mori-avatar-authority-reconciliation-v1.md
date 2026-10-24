# Otaku-mori Avatar Authority Reconciliation v1

**Status:** Companion authority — reconciliation only  
**Applies to:** `Otaku-mori Avatar Production Contract v1` and `Otaku-mori Base Character Visual Authority v1`

## 1. Purpose

This document reconciles the two owner-side Avatar authorities without replacing or weakening either one.

The **Avatar Production Contract** governs runtime architecture, asset formats, skeleton/morph semantics, persistence, performance, failure behavior, integration, and production-state progression.

The **Base Character Visual Authority** governs what the characters must look and feel like: anatomy, stylization, silhouette, face design, hair, wardrobe, creator presentation, lighting, motion, and owner visual acceptance.

Where both speak to the same topic, use the stricter requirement unless the owner explicitly supersedes it.

## 2. Authority precedence

1. Explicit latest owner decision.
2. Base Character Visual Authority for visual/art-direction decisions.
3. Avatar Production Contract for technical/runtime/asset-pipeline decisions.
4. Production Asset Registry for asset state/provenance.
5. Existing repository implementation.
6. Placeholder/procedural/test infrastructure.

Repository presence never outranks owner approval.

## 3. Harmonized launch target

Canonical direction:

**adult anime-stylized realism with credible anatomy and materials, dark contemporary fantasy styling, and premium action-RPG presentation.**

Use approximately 60–65% anime-directed visual language and 35–40% anatomical/material realism as a visual target, not a shader value.

The system must support meaningfully different adult identities without collapsing into one face, one body, or one stereotype.

## 4. Base-body alignment

Launch requires:

- `female_base_v1`
- `male_base_v1`
- one compatible semantic humanoid skeleton contract;
- shared world scale/root convention;
- shared semantic morph vocabulary where applicable;
- clothing authored for the supported morph envelopes.

Female and male bases must share the same art universe without becoming the same mesh with superficial parameter changes.

Two excellent configurable bases are preferable to a large inconsistent library.

## 5. Skeleton freeze

Before wardrobe production scales, freeze:

- canonical bone names;
- root orientation and unit scale;
- bind-pose convention;
- required finger chains;
- optional secondary-motion chains;
- version identifier.

No garment-specific humanoid skeleton forks.

Any sourced candidate that cannot conform without destructive retargeting remains `CANDIDATE` or is rejected.

## 6. Morph freeze

The Production Contract's semantic morph vocabulary is runtime authority. The Visual Authority defines the acceptable visual envelope.

Before final production:

- freeze launch morph names;
- define safe numeric ranges;
- test isolated extremes;
- test dangerous combinations;
- verify face profile and 3/4 quality;
- verify garment deformation across body ranges;
- persist semantic values, never raw morph indices.

Frame, softness, and muscularity remain distinct concepts.

## 7. Face priority

The face is the highest-value region.

Production faces must pass front, 3/4, profile, slight high/low angles, neutral, blink, subtle smile, and subtle frown.

Immediate rejection includes disappearing nose geometry, recessed/tiny chin, floating eyes, permanent pout, lifeless expression, or marketplace-filter sameness.

## 8. Hair reconciliation

Launch roster:

- `long_layered_01`
- `long_straight_01`
- `medium_wolf_01`
- `bob_01`
- `short_texture_01`
- `ponytail_01`
- `updo_01`
- `alt_asymmetric_01`

Hair is silhouette-first and geometry-led. Limited alpha cards are acceptable; noisy strand systems are not.

`medium_wolf_01` is the first female/signature vertical-slice target.

`short_texture_01` is the first male/unisex vertical-slice target.

## 9. Wardrobe reconciliation

Launch wardrobe reads as one capsule collection: contemporary alternative, gothic, restrained anime-fantasy utility, subtle Commander/military influence, and modern streetwear.

Avoid costume-store fantasy, random medieval armor, cosplay clutter, unexplained ornament, and tassels by default.

Priority vertical-slice outfits:

- `commander_combat_01`
- `urban_fantasy_01`

Garments must be morph-safe and use body-hiding/masking where appropriate instead of per-frame clipping hacks.

## 10. Materials and lighting

Character materials remain physically distinct: skin, eyes/cornea, hair, cloth, leather, metal, markings.

Do not globally tint the character.

Creator lighting uses a soft warm-neutral key, restrained fill, subtle rim, charcoal environment, and minimal sakura/bronze atmospheric accent.

Lighting must expose defects rather than hide them.

## 11. Runtime convergence

Do not build a third avatar architecture.

Converge existing infrastructure into:

`AvatarConfig`
→ `AvatarResolver`
→ `AssetManifest`
→ `AvatarScene`
→ `MorphController`
→ `MaterialController`
→ `WardrobeController`
→ `AnimationController`
→ `QualityController`

UI writes semantic configuration. Rendering consumes resolved configuration.

Signed-in canonical state belongs in the database. Local storage may support guest/draft convenience only.

## 12. React / R3F compatibility gate

The current React 18 + R3F 9 declaration is a known compatibility warning.

Avatar Production Closure must explicitly verify and resolve the supported pairing in a dedicated bounded dependency decision.

Do not opportunistically upgrade or downgrade during unrelated asset work.

## 13. Vertical-slice sequence

### Female proof

`female_base_v1`
→ face morphs
→ body morphs
→ `medium_wolf_01`
→ `commander_combat_01`
→ skin/eye/hair material edits
→ save
→ hard reload
→ visually equivalent reconstruction
→ Commander
→ edit again
→ no drift
→ resource cleanup verified

### Male proof

`male_base_v1`
→ face/body morphs
→ `short_texture_01`
→ `urban_fantasy_01`
→ same persistence/integration proof

Do not mass-produce the launch catalog before both slices work.

## 14. Asset-state discipline

`MISSING`
→ `CONCEPT`
→ `CANDIDATE`
→ `OWNER_APPROVED`
→ `RUNTIME_READY`
→ `INTEGRATED`
→ `QA_PASSED`

Also: `DEFERRED`, `REJECTED`.

No automatic promotion.

A generated, purchased, downloaded, or repository-present mesh remains `CANDIDATE` until topology, license, compatibility, visual quality, and editability are verified.

## 15. Performance alignment

Review targets for a typical equipped high-detail avatar:

- ~65k–120k triangles;
- review above ~150k;
- compressed initial visible package target ~12–18 MB;
- draw calls aim <=70, review above 100;
- visible unique materials aim <=20–30, review above 35.

These are review targets rather than blind rejection thresholds.

Use High / Balanced / Low quality tiers. Identity must not change between tiers.

## 16. Owner acceptance

Avatar is not visually closed until owner can answer yes to:

- base faces are attractive before customization;
- substantially different people can be created;
- anatomy remains credible at all angles;
- hair feels authored;
- clothing belongs to the same bodies/world;
- creator feels like Otaku-mori rather than a plugin;
- mobile remains desirable;
- Commander preserves the same identity;
- the result is trailer-worthy.

## 17. Immediate next authority decisions

Before Avatar Production Closure scales:

1. freeze skeleton naming/version;
2. freeze launch morph inventory/ranges;
3. audit the existing legacy base GLB candidate;
4. choose/procure/create production female base;
5. choose/procure/create production male base;
6. prove female vertical slice;
7. prove male vertical slice;
8. only then expand catalog.
