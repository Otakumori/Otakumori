# Otaku-mori Home Portrait Asset Authority v1

**Status:** Owner-side production authority  
**Applies to:** Home environmental world art for portrait/mobile presentation  
**Primary target:** 390×844 portrait viewport  
**Relationship to existing authority:** Complements, but does not replace, the approved Home wide-world source contract, the Otaku-mori Avatar Production Contract v1, or the Base Character Visual Authority v1.

---

## 1. Purpose

This document defines the canonical production requirements for dedicated portrait/mobile Home world masters.

The objective is not to create a separate mobile world. The portrait family must present the **same authored Otaku-mori location** as the approved wide Home masters, recomposed for portrait use so that the world remains legible, cinematic, and intentional on phone screens.

Portrait production exists to eliminate the current compromise where mobile presentation depends on cropping approved wide art.

The portrait family is a **Tier-0 Home asset family**. Presence in the repository, visual similarity to the wide art, or technical compatibility does not constitute approval.

---

## 2. Existing Wide Authority

The approved Home world is currently represented by six wide masters:

1. `om-home-world-01-early-morning-wide.png`
2. `om-home-world-02-morning-wide.png`
3. `om-home-world-03-afternoon-wide.png`
4. `om-home-world-04-late-afternoon-wide.png`
5. `om-home-world-05-night-wide.png`
6. `om-home-world-06-special-twilight-wide.png`

Canonical wide source directory:

`docs/design/references/home-world-wide-approved/`

Current wide master dimensions:

`1325 × 1187`

Current runtime directory:

`public/assets/home/world/combined/`

Current runtime time-state authority:

`app/components/hero/homeScene.ts`

The current mobile behavior is a crop of the approved wide masters. That crop remains an interim fallback only.

---

## 3. Canonical Portrait Family

Canonical portrait source directory:

`docs/design/references/home-world-portrait-approved/`

Canonical filenames:

- `om-home-world-01-early-morning-portrait.png`
- `om-home-world-02-morning-portrait.png`
- `om-home-world-03-afternoon-portrait.png`
- `om-home-world-04-late-afternoon-portrait.png`
- `om-home-world-05-night-portrait.png`
- `om-home-world-06-special-twilight-portrait.png`

Future runtime derivatives belong under:

`public/assets/home/world/combined/`

The source master is authoritative. Runtime files are delivery derivatives and do not outrank the approved source.

---

## 4. Production Principle

The portrait family must be authored as:

**one consistent physical world composition + six lighting/time-state variants**

not:

**six unrelated mobile illustrations**

The following environmental identity must remain recognizably consistent across all portrait states:

- sakura tree identity and trunk architecture;
- canopy massing;
- shoreline/horizon;
- castle or distant landmark relationship;
- root descent;
- surface-to-underground transition;
- underground root network;
- cavern/footer environment;
- major lighting-source locations where physically relevant.

Time-state changes may alter:

- sky;
- atmospheric color;
- sun/moon authority;
- water reflection;
- ambient illumination;
- environmental contrast;
- subtle emissive or reflective cues;
- atmospheric haze.

Time-state changes must not arbitrarily alter world geometry.

---

## 5. Primary Portrait Artboard

Primary authored target:

`390 × 844`

This is the reference composition size, not the only supported runtime viewport.

The portrait master must retain enough crop tolerance to survive nearby device widths/heights without losing the major world beats.

### Recommended production resolution

The source master should be produced at a larger integer scale than the runtime reference so that optimization and device-density delivery remain possible.

Recommended source targets:

- minimum: `1170 × 2532` (3× the 390×844 reference);
- preferred where source quality supports it: `1560 × 3376` (4×).

Do not upscale a weak small image merely to satisfy these numbers. Source quality outranks nominal pixel count.

---

## 6. Portrait Composition Zones

The following zones are visual-composition targets, not CSS positioning instructions.

### A. Top Navigation Safety — 0–11%

Purpose:
- protect logo/navigation readability;
- avoid placing critical scenic detail directly beneath persistent controls.

Requirements:
- no irreplaceable focal object;
- avoid extreme high-frequency branch clutter;
- preserve enough scene texture that the area still feels environmental.

### B. Surface Identity — 12–38%

Purpose:
- establish the Otaku-mori world immediately.

Requirements:
- tree must read as intentional framing, not accidental crop;
- horizon remains understandable;
- castle/distant landmark remains legible where present;
- canopy helps frame the composition without crushing the UI zone.

### C. Hero / Search Safety — 34–56%

Purpose:
- support hero heading, search, and primary interaction.

Requirements:
- quieter value structure behind primary copy;
- avoid branch tangles directly behind text;
- avoid placing the strongest scenic focal point where controls must obscure it;
- preserve enough environmental detail that the UI still feels embedded in the world.

### D. Root Transition — 52–70%

Purpose:
- communicate movement from Surface to Underground.

Requirements:
- visible and coherent root descent;
- surface/ground relationship remains understandable;
- no abrupt crop that makes the underground feel like a separate image;
- roots should visually lead the user downward.

### E. Underground / Footer Region — 68–100%

Purpose:
- contain rooted footer, Soapstone, and lower-world navigation.

Requirements:
- preserve cavern depth;
- maintain readable negative space around text groups;
- avoid requiring a full-width dark overlay;
- footer content should appear embedded in the environment;
- Soapstone should have a plausible “found object” location.

---

## 7. Responsive Safe-Zone Envelope

The 390×844 composition is primary, but portrait masters should remain viable across representative mobile viewports.

Minimum QA envelope:

- `360×800`
- `390×844`
- `412×915`
- `430×932`

The art should not require separate runtime transforms for each width.

Acceptable:
- bounded `object-position` tuning;
- minor crop shifts;
- safe-region adjustments.

Not acceptable:
- moving the tree to another side;
- hiding the castle entirely;
- breaking the root transition;
- using extreme zoom to avoid bad composition;
- reconstructing the world from separate layers solely for mobile.

---

## 8. State-Specific Authority

### 8.1 Early Morning

Target:
- pre-sunrise / first-light atmosphere;
- cool-to-neutral dawn;
- restrained warmth beginning at horizon;
- readable tree and castle silhouette;
- underground remains quiet but not crushed.

Avoid:
- generic blue filter;
- overly bright daytime exposure.

### 8.2 Morning

Target:
- soft clean daylight;
- gentle environmental separation;
- readable sakura color;
- calm water/light response.

Avoid:
- flat white daylight;
- oversaturated sky.

### 8.3 Afternoon

Target:
- established daylight;
- clear environmental readability;
- balanced saturation;
- enough value contrast for hero controls.

Avoid:
- “default stock daytime” appearance.

### 8.4 Late Afternoon

This is the preferred first production slice.

Target:
- warm copper/bronze authority;
- strong but restrained sunset energy;
- sakura remains distinct from bronze;
- surface and underground retain continuity.

Reason for first-slice priority:
this state currently provides the strongest wide-world visual authority and is the clearest test of whether the portrait composition preserves the Home identity.

### 8.5 Night

Night must use the owner-approved moonlit Night world as its visual authority.

Target:
- unmistakably nocturnal;
- moonlit blue-black/cool palette;
- readable tree/castle silhouette;
- moon or sky authority remains believable;
- reflected moonlight/water response;
- underground remains visible without becoming artificially bright.

Do not create Night via:
- CSS tint;
- brightness filter;
- blue overlay;
- dark vignette over daytime art.

### 8.6 Special Twilight

Target:
- authored violet/sakura twilight state;
- visually distinct from both late-afternoon and Night;
- preserve the same world geometry;
- atmospheric rather than neon.

Avoid:
- generic purple color wash;
- excessive glow.

---

## 9. Wide-to-Portrait Continuity Rules

A portrait master must read as the same location immediately when compared side-by-side with its wide state.

Required continuity:

- tree species and trunk form;
- root placement logic;
- castle/shoreline relationship;
- water direction;
- major foreground silhouettes;
- underground architecture;
- major rock/root landmarks;
- overall material language.

Permitted portrait adaptation:

- reframing;
- rebalancing tree/castle visibility;
- extending or restoring cropped environmental regions;
- redistributing non-critical branch/canopy detail;
- adjusting atmospheric negative space;
- changing local light placement if required by the portrait composition while preserving the same scene logic.

Not permitted:

- entirely new tree design;
- unrelated castle;
- different shoreline;
- different cavern;
- arbitrary added architecture;
- baked interface elements;
- baked text;
- baked interactive petals.

---

## 10. Discovery Before Creation

Before generating, repainting, extending, or recompositing any portrait master, search for existing owner/source material.

Search for:

- portrait exports;
- mobile exports;
- vertical renders;
- uncropped source images;
- larger source masters;
- layered source files;
- alternate crops;
- earlier rejected-but-recoverable portrait candidates.

Useful filename patterns:

- `*home*portrait*`
- `*home*mobile*`
- `*world*portrait*`
- `*world*vertical*`
- `*tree*portrait*`
- `*tree*mobile*`
- `*morning*portrait*`
- `*afternoon*portrait*`
- `*night*portrait*`
- `*twilight*portrait*`

Any discovered file enters as:

`CANDIDATE`

until reviewed.

Repository presence alone is not approval.

---

## 11. Creation Methods

Preferred order:

1. Existing owner-approved portrait master.
2. Existing owner candidate requiring cleanup.
3. Recomposition from a higher-resolution or layered approved source.
4. Controlled extension/inpainting of an approved source.
5. New generation/repaint only where no usable source exists.

Generation is therefore a fallback, not the default production method.

When generation or extension is used:

- preserve the original scene identity;
- avoid unnecessary stylistic reinterpretation;
- maintain geometry continuity across states;
- use the approved wide state as direct visual authority;
- treat first output as `CANDIDATE`, never final authority.

---

## 12. First Production Slice

Produce/recover first:

`om-home-world-04-late-afternoon-portrait.png`

This slice must prove:

- tree framing;
- horizon/castle preservation;
- hero safe zone;
- root descent;
- underground/footer relationship;
- continuity with the wide late-afternoon master;
- successful composition at 390×844;
- crop tolerance across nearby phone sizes.

Only after owner approval of the structural composition should the remaining time-state portraits scale from it.

The intent is to freeze **portrait geometry authority** before multiplying the art family.

---

## 13. Night Production Reference

The Night portrait must preserve the owner-approved Night scene identity.

The canonical wide Night slot is:

`om-home-world-05-night-wide.png`

The portrait Night should therefore become:

`om-home-world-05-night-portrait.png`

The portrait Night is not expected to be a literal center crop. It should be an authored portrait recomposition of the same world and lighting state.

---

## 14. Petal and UI Separation

Do not bake interactive UI into portrait masters.

The portrait art must not permanently contain:

- Petal Wallet;
- interactive petals;
- search UI;
- Hero text;
- navigation;
- footer links;
- Soapstone message text;
- buttons;
- badges;
- notifications.

Ambient decorative petals should also remain separate unless a specific noninteractive background petal is deliberately part of the painting.

The existing interactive Petal system remains a runtime layer.

---

## 15. Soapstone Environment Support

The portrait environment should provide a plausible lower-world location for the Soapstone artifact.

The environment must not require the Soapstone to become a large text plaque.

Visual model:

1. resting artifact/rune;
2. discovered/focused rune response;
3. separate readable message after interaction.

The world art should support the object without baking the message into the texture.

---

## 16. Footer Environment Support

The portrait master must allow the rooted footer to remain readable without a broad full-width dark slab.

The art should provide:

- local value separation;
- quieter zones around major link groups;
- environmental depth behind the footer;
- visible roots/cavern context;
- enough negative space for legal/support copy.

Localized text shadows or subtle runtime local gradients remain acceptable.

The artwork should not depend on a conventional rectangular footer panel.

---

## 17. Technical Delivery Requirements

For every portrait asset, record:

- asset ID;
- source master path;
- source dimensions;
- file format;
- checksum;
- corresponding wide master;
- time state;
- owner approval state;
- runtime derivative path;
- runtime dimensions;
- compression;
- safe-zone metadata;
- QA status.

Preferred runtime strategy:

- retain lossless or high-quality source master outside the delivery path;
- produce optimized WebP/AVIF derivatives where visual quality is verified;
- preserve PNG only where needed for source authority or where compression alternatives degrade the art materially;
- use responsive image delivery;
- do not ship unnecessarily large masters directly to mobile.

---

## 18. Production Asset Registry IDs

Canonical family:

`home.world.<time-state>.portrait-v1`

Proposed launch IDs:

- `home.world.early-morning.portrait-v1`
- `home.world.morning.portrait-v1`
- `home.world.afternoon.portrait-v1`
- `home.world.late-afternoon.portrait-v1`
- `home.world.night.portrait-v1`
- `home.world.special-twilight.portrait-v1`

State model:

`MISSING`
→ `CONCEPT`
→ `CANDIDATE`
→ `OWNER_APPROVED`
→ `RUNTIME_READY`
→ `INTEGRATED`
→ `QA_PASSED`

Also allowed:

`DEFERRED`
`REJECTED`

No automatic promotion.

---

## 19. Candidate Acceptance Criteria

A portrait candidate passes visual review only if all are true:

### Composition
- feels authored for portrait;
- does not feel like a narrow desktop crop;
- tree framing is intentional;
- castle/horizon remain legible where appropriate;
- hero safe zone is usable;
- root transition is clear;
- underground/footer region remains visually coherent.

### Continuity
- immediately reads as the same Home world as its wide counterpart;
- state-to-state geometry remains stable;
- no accidental environmental redesign.

### Quality
- no duplicated or malformed roots;
- no broken tree branches;
- no distorted castle;
- no impossible shoreline;
- no obvious generative artifacts;
- no muddy lower-world detail;
- no obvious upscaling damage.

### UI compatibility
- no baked interface;
- no unavoidable high-frequency clutter behind key text;
- footer does not require a large dark panel;
- Soapstone can exist as a found artifact.

### Mobile
- strong at 390×844;
- remains viable across the defined mobile QA envelope;
- no critical subject is lost at neighboring aspect ratios.

---

## 20. Immediate Rejection Conditions

Reject immediately if:

- the image is simply a center crop of the wide master and loses environmental storytelling;
- the tree changes identity between time states;
- roots are malformed or spatially incoherent;
- the castle or shoreline shifts arbitrarily between states;
- Night is created through a color filter rather than authored art;
- special twilight is only a purple overlay;
- visual hierarchy forces UI to obscure the strongest focal point;
- footer requires a full-width dark slab;
- baked UI/text is present;
- petals are baked in as interactive-looking objects;
- image quality falls below the approved wide family;
- the image reads as a different location.

---

## 21. Owner Review Packet

For each candidate provide:

- full portrait at 390×844;
- 360×800 crop;
- 412×915 crop;
- 430×932 crop;
- side-by-side with corresponding wide master;
- hero/search overlay preview;
- footer/Soapstone overlay preview;
- 100% crop of tree/root detail;
- source dimensions;
- runtime derivative dimensions;
- file size;
- checksum;
- asset ID;
- production state.

For the first late-afternoon slice also provide:

- wide vs portrait structural comparison;
- safe-zone overlay;
- no-UI art view;
- UI composite view.

---

## 22. Approval Sequence

Portrait production should proceed in this order:

1. Discover existing source/candidate material.
2. Select/recover best late-afternoon source.
3. Produce late-afternoon portrait candidate.
4. Review portrait geometry.
5. Owner approves structural composition.
6. Freeze portrait composition authority.
7. Produce the remaining five lighting/time variants.
8. Review all six together for world continuity.
9. Owner approves each state.
10. Produce runtime derivatives.
11. Register assets.
12. Integrate into Home runtime.
13. Verify responsive selection.
14. Run Home visual QA.
15. Run performance/CLS/LCP checks.
16. Promote to `QA_PASSED`.
17. Re-open Home final owner review.

Do not mass-produce all six before step 5.

---

## 23. Codex Integration Boundary

Codex should not invent portrait art direction.

Codex responsibilities after owner-approved masters exist:

- verify file identity/checksums;
- preserve canonical filenames;
- generate or validate runtime derivatives;
- extend `homeScene.ts` with portrait authority;
- implement responsive image selection;
- preserve current image-readiness and fallback architecture;
- preserve time-state mapping;
- keep wide masters unchanged;
- test 390×844, 768×1024, 1280×900;
- verify no new CLS/hydration regression;
- verify portrait master is actually selected on the intended viewport;
- update asset registry and release ledger.

Codex must not:

- silently generate replacement portrait art;
- alter approved compositions;
- fake missing states with CSS filters;
- reinterpret the world geometry;
- mark a candidate approved;
- merge Home without owner visual approval.

---

## 24. Relationship to Avatar Authority

This document governs **Home environmental portrait artwork only**.

It does not govern:

- avatar base meshes;
- skeleton;
- morph targets;
- hair;
- clothing;
- character materials;
- Avatar Creator rendering;
- Commander character identity.

Those remain under:

- `Otaku-mori Avatar Production Contract v1`
- `Otaku-mori Base Character Visual Authority v1`

The Home portrait family and Avatar system may share the broader Otaku-mori visual language, but they remain separate production domains.

---

## 25. Release Gate

Current truthful state before portrait production:

`HOME VISUAL CLOSURE BLOCKED — ASSET PRODUCTION REQUIRED`

Portrait completion does not automatically approve Home.

Final Home approval still requires:

- approved portrait masters;
- correct runtime selection;
- visual continuity across time states;
- stable responsive composition;
- acceptable performance;
- owner visual approval of the integrated Home.

Final owner-controlled state:

`HOME FLAGSHIP APPROVED`