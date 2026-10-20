# Otaku-mori Base Character Visual Authority v1

Status: **Tier-0 visual authority — owner-side production specification**
Applies to: Avatar Creator, Commander avatar presentation, and any future game-facing player-character representation derived from the canonical avatar.

## 1. Core identity

The Otaku-mori avatar is not a generic anime avatar, dress-up doll, mascot, or VRChat body.

The target is:

**adult anime-stylized realism with convincing anatomy, deliberate beauty, dark contemporary fantasy fashion, and a premium action-RPG presentation language.**

The character should feel plausible in a modern dark-anime action RPG while remaining unmistakably stylized.

Primary visual balance:
- realism in anatomy, materials, weight, and lighting;
- stylization in facial proportion, silhouette, eye design, hair massing, and graphic direction;
- restraint in surface noise, fantasy ornament, glow, and exaggerated sexualization;
- strong personal expression through face, body, hair, clothing, markings, and accessories.

The goal is not to make every avatar conventionally identical. The system must permit elegant, severe, soft, cute, gothic, athletic, mature, androgynous, and dramatic results without falling outside one coherent art family.

---

## 2. Stylization envelope

### Global

Target stylization:
- approximately 60–65% anime-directed;
- approximately 35–40% anatomical/material realism.

This is a visual target, not a shader percentage.

Characters must read as human adults first, anime-stylized characters second.

Avoid:
- chibi heads;
- toy-like hands/feet;
- oversized eyes that dominate the face;
- impossibly tiny noses/mouths;
- hyper-photoreal skin;
- exaggerated hourglass defaults;
- ultra-wide shoulders as a mandatory male default;
- extreme sexual dimorphism baked into the base meshes.

### Head-to-body proportion

Preferred default:
- female: ~7.2–7.5 heads tall;
- male: ~7.3–7.7 heads tall.

Allowed authored customization envelope:
- approximately 6.9–7.8 heads tall.

Do not use head scaling as a cheap substitute for body-height customization.

---

## 3. Female base visual authority

### Default silhouette

The female launch base should be:
- adult;
- compact-to-average frame;
- balanced shoulder-to-hip relationship;
- defined waist without implausible constriction;
- natural ribcage/pelvis transition;
- anatomically credible arms/legs/hands/feet;
- soft enough to support curvy results;
- structured enough to support athletic results.

The default should not force:
- extremely large breasts;
- extremely narrow waist;
- thigh-gap anatomy;
- exaggerated buttocks;
- permanently posed lumbar arch.

### Supported silhouette families

The same base should be able to reach:

**Petite**
- lighter frame;
- narrower shoulders/hips;
- smaller torso volume;
- remains adult in facial/body proportion.

**Balanced**
- neutral launch default;
- neither notably thin nor curvy.

**Soft / Curvy**
- fuller chest/hips/thighs;
- softer abdomen/limbs;
- preserved anatomical transitions.

**Athletic**
- more shoulder and limb definition;
- firmer silhouette;
- modestly reduced softness.

**Strong**
- visibly developed shoulders, arms, back, thighs;
- not a male body with a different chest.

No family should require a separate incompatible skeleton.

### Female face

Default face:
- softly tapered lower face;
- visible cheekbone structure;
- moderate jaw definition;
- chin neither tiny nor overly pointed;
- nose has real bridge/tip volume;
- lips have clear shape without filler-like exaggeration.

Anime direction:
- eyes somewhat larger than realistic;
- iris presentation expressive;
- lashes/brow geometry deliberately graphic;
- face remains convincing in profile and 3/4 view.

Reject:
- flat side profile;
- tiny recessed chin;
- nose that disappears from side view;
- permanent pout;
- "Instagram filter" sameness across presets.

---

## 4. Male base visual authority

### Default silhouette

The male launch base should be:
- adult;
- lean-to-average frame;
- believable clavicle/shoulder structure;
- tapered torso without superhero exaggeration;
- proportionate arms and legs;
- hands/feet sized naturally;
- capable of softer and more muscular results.

Do not default to:
- bodybuilder shoulders;
- six-pack abstraction;
- enormous neck/traps;
- hypermasculine jaw;
- implausibly narrow hips.

### Supported silhouette families

**Lean**
- narrow-to-moderate frame;
- low-to-moderate muscle definition.

**Balanced**
- neutral default.

**Athletic**
- stronger shoulder/arm/leg definition;
- modest torso taper.

**Broad**
- increased frame width;
- larger chest/back;
- proportionally adjusted limbs.

**Muscular**
- visibly developed anatomy;
- still plausible under clothing and animation.

### Male face

Default:
- defined but not oversized jaw;
- natural chin projection;
- real nose bridge/tip;
- expressive anime-directed eyes;
- brows can carry stronger visual weight;
- mouth retains actual form rather than a line.

The male and female faces should clearly share the same art universe without being the same head with parameter changes.

---

## 5. Face design system

The face is the highest-value region of the avatar.

Every production face must look good in:
- front;
- 3/4;
- profile;
- slight high angle;
- slight low angle;
- neutral expression;
- blink;
- subtle smile;
- subtle frown.

### Eyes

Target:
- expressive but structurally believable;
- slightly enlarged orbital presentation;
- visible upper/lower lid geometry;
- convincing eyeball placement;
- clean eyelash silhouette.

Do not let eyes float or protrude unnaturally in profile.

Launch presets should cover:
- soft round;
- narrow mature;
- lifted/cat-eye;
- downturned/soft;
- balanced almond;
- dramatic anime.

### Nose

The nose must exist as real geometry.

Customization may alter:
- width;
- length;
- bridge width/depth;
- tip projection;
- tip width.

Avoid:
- pure texture noses;
- nearly invisible bridges;
- one universal tiny upturned nose.

### Mouth

Target:
- clear cupid/upper-lip structure;
- lower-lip volume;
- natural corners;
- correct facial integration from side view.

Avoid:
- permanent duck-face;
- extremely tiny mouths;
- lip color being mistaken for geometry.

### Jaw / chin / cheeks

These should produce visibly different identities without breaking the anime family.

Important combinations to test:
- soft jaw + broad cheek;
- narrow jaw + high cheek;
- square jaw + compact chin;
- long chin + narrow face;
- round face + fuller cheek.

---

## 6. Body customization rules

Morph ranges must be attractive and deformation-safe.

Every slider should represent a believable authored envelope, not arbitrary numerical freedom.

### Height

Height changes should:
- preserve overall body plausibility;
- distribute through legs/torso thoughtfully;
- not simply scale the whole character uniformly;
- keep camera framing automatic.

### Frame / softness / muscularity

These are distinct concepts:
- frame = skeletal/structural breadth;
- softness = fat/soft-tissue presentation;
- muscularity = muscle volume/definition.

Do not collapse all three into one "weight" slider.

### Chest / waist / hips

Support meaningful variation while protecting:
- ribcage shape;
- shoulder relationship;
- pelvic anatomy;
- garment compatibility.

### Legs

Thigh/calf volume changes must retain:
- knee readability;
- hip transition;
- ankle structure;
- plausible leg silhouette from all angles.

No forced thigh gap.

### Hands / feet

These must be deliberately modeled and proportionate.

Poor hands/feet are a Tier-0 visual rejection condition.

---

## 7. Silhouette philosophy

The avatar should be recognizable in flat silhouette.

Priority hierarchy:
1. hair silhouette;
2. head/face contour;
3. shoulder/torso proportion;
4. outfit silhouette;
5. leg/foot silhouette;
6. accessories.

Do not rely on texture complexity to create identity.

If a character only becomes interesting after zooming in, the silhouette system is insufficient.

---

## 8. Hair authority

Hair is a primary identity system.

### Art style

Use:
- large purposeful anime hair masses;
- controlled strand/group breakup;
- silhouette-first design;
- believable root direction;
- restrained flyaways;
- limited transparency.

Avoid:
- helmet hair;
- spaghetti strands;
- overly realistic strand grooming;
- alpha-card noise;
- obvious clipping through face/shoulders.

### Launch family

1. `long_layered_01`
   - long layered silhouette;
   - soft face framing;
   - gentle back volume.

2. `long_straight_01`
   - sleek;
   - heavier graphic curtain;
   - useful for gothic/serious characters.

3. `medium_wolf_01`
   - layered shag/wolf cut;
   - strong alt identity;
   - one of the signature launch silhouettes.

4. `bob_01`
   - clean jaw/neck framing;
   - strong face visibility.

5. `short_texture_01`
   - cropped/textured;
   - works across masculine/feminine presentation.

6. `ponytail_01`
   - high/medium pony;
   - controlled secondary motion.

7. `updo_01`
   - elegant dark-fantasy/formal option.

8. `alt_asymmetric_01`
   - signature asymmetrical style;
   - intentionally modern/goth.

### Hair color

Base color system:
- black;
- blue-black;
- dark brown;
- warm brown;
- auburn;
- platinum;
- ash;
- silver;
- muted rose;
- wine/red;
- deep violet;
- dark blue;
- user color selector within material-safe gamut.

Optional secondary/highlight coloration can come later unless already supported well.

---

## 9. Wardrobe visual authority

Launch wardrobe should feel like a capsule collection designed for one world.

### Design language

Blend:
- contemporary alternative fashion;
- gothic femininity/masculinity;
- restrained anime-fantasy utility;
- subtle military/Commander influence;
- modern streetwear.

Avoid:
- costume-store fantasy;
- random medieval armor;
- cosplay clutter;
- excessive straps/buckles;
- unexplained tassels;
- large decorative wings/horns by default;
- inconsistent decades/styles without deliberate intent.

### Launch pieces

#### Tops
`fitted_highneck_01`
- dark fitted high-neck;
- elegant base layer;
- strong silhouette under jackets.

`cropped_structured_jacket_01`
- tailored cropped jacket;
- subtle bronze hardware;
- contemporary fantasy/military influence.

`dark_soft_blouse_01`
- softer drape;
- feminine/androgynous depending fit;
- minimal ornament.

#### Bottoms
`highwaist_trouser_01`
- fitted-to-straight dark trouser;
- versatile flagship option.

`asymmetric_skirt_01`
- gothic asymmetric skirt;
- controlled cloth movement.

`utility_skirtshort_01`
- modern practical silhouette;
- anime action-RPG energy without tactical-cosplay overload.

#### Full looks
`gothic_dress_01`
- sleek dark dress;
- elegant, adult, restrained;
- no ornamental overload.

`commander_combat_01`
- structured long-line or layered command silhouette;
- functional seam logic;
- restrained bronze;
- visually connected to Commander Archive.

`urban_fantasy_01`
- contemporary jacket/top/bottom integration;
- everyday wearable but authored.

#### Shoes
`platform_boot_01`
`combat_boot_01`
`minimal_lowboot_01`

Footwear must have convincing soles, toe boxes, ankle articulation, and weighting.

### Accessories

Initial:
- minimal choker;
- drop earrings;
- studs;
- round glasses;
- narrow glasses;
- bronze hairpin;
- pendant;
- wrist cuff.

Accessories should enhance identity without becoming required visual noise.

---

## 10. Color authority

The creator should support personal colors without making every avatar look disconnected from Otaku-mori.

UI environment:
- charcoal;
- bronze structural accents;
- restrained sakura;
- glass only where functionally justified.

Character palette itself may be broader.

Hair/clothing user colors should:
- retain material response;
- avoid destroying texture/value structure;
- clamp impossible emissive brightness;
- keep metal/cloth/skin physically distinct.

Do not tint the whole character with one global palette.

---

## 11. Creator stage composition

### Desktop

Preferred:
- character stage occupies ~55–65% of primary horizontal authority;
- control system occupies ~35–45%;
- character remains large enough for full-body judgment;
- face edit automatically changes camera rather than requiring manual zoom.

The creator should feel like a game character-creation chamber, not an ecommerce configurator.

### Mobile

Preferred:
- character stage remains visually dominant above;
- controls become a bottom drawer/tabbed sheet;
- active category and current value always visible;
- avoid full-screen form stacks that hide the character.

Touch:
- one-finger orbit;
- pinch zoom if used;
- buttons for reset camera and framing;
- all edits possible without gestures.

---

## 12. Creator environment

Visual concept:
**Commander identity chamber / subterranean archive atelier.**

Environment:
- charcoal architecture;
- subtly recessed display plinth;
- restrained bronze framing;
- faint sakura atmospheric accent;
- controlled background depth;
- no visual competition with character.

Possible narrative framing:
the user is not "making a profile picture"; they are **forming their manifested identity** within the Archive.

Keep copy restrained.

Avoid:
- giant lore paragraphs;
- excessive runes around every control;
- glowing sci-fi hologram clichés;
- generic neon character pod.

---

## 13. Lighting authority

Three-light conceptual rig:

**Key**
- soft;
- slightly warm-neutral;
- front/3-quarter;
- reveals face planes and material response.

**Fill**
- low-intensity;
- prevents crushed shadow;
- neutral.

**Rim**
- restrained;
- separates hair/shoulders from charcoal background;
- subtle bronze/sakura temperature acceptable.

Environment:
- dark enough to frame silhouette;
- not so dark that black hair/clothing disappears.

Skin must remain readable across the full supported tone range.

Lighting QA must include:
- very light skin;
- medium skin;
- deep skin;
- black hair;
- pale hair;
- matte black clothing;
- reflective accessory.

---

## 14. Motion authority

Idle motion:
- subtle breathing;
- minute posture shifts;
- occasional natural blink;
- optional small gaze movement.

Do not:
- constantly sway;
- perform exaggerated idle poses;
- bounce;
- use seductive loops as default;
- obscure facial edits.

Category transitions:
- camera eases;
- character may subtly reorient;
- no dramatic spin every selection.

Selection feedback:
- immediate;
- material-aware;
- no particle explosion for routine edits.

---

## 15. Expression authority

Launch minimum:
- neutral;
- soft smile;
- serious;
- mildly amused;
- determined.

Expression is for preview/presentation and future identity richness.

Do not save a highly exaggerated expression as the only default Commander representation.

Neutral should still feel alive.

---

## 16. Preset philosophy

Presets should demonstrate the system without defining all users.

Recommended launch presets:
- `Archive Wanderer`
- `Sakura Nocturne`
- `Bronze Revenant`
- `Midnight Civilian`
- `Ash Vanguard`
- `Velvet Mechanist`

Each preset may set:
- base;
- face morph values;
- hair;
- palette;
- outfit;
- makeup;
- accessories.

Presets must remain editable.

Avoid gender stereotypes such as "male = warrior / female = cute."

---

## 17. Character differentiation test

At launch, create at least 12 test avatars across:
- male/female bases;
- soft/strong faces;
- multiple skin tones;
- multiple hair silhouettes;
- slim/soft/athletic/strong body ranges;
- multiple clothing families.

Pass condition:
all 12 look like different people but the same game.

Fail conditions:
- all faces look genetically identical;
- hair/outfit does all the identity work;
- changing sliders barely affects appearance;
- some combinations fall outside the art style.

---

## 18. Vertical slice authority

Before scaling the asset library, prove one complete vertical slice:

**female_base_v1**
→ meaningful face morphs
→ meaningful body morphs
→ `medium_wolf_01`
→ `commander_combat_01`
→ eye/hair/skin material edits
→ creator lighting
→ save
→ hard reload
→ identical reconstruction
→ Commander render
→ edit again
→ no drift
→ resource cleanup verified.

Then repeat on:

**male_base_v1**
→ `short_texture_01`
→ `urban_fantasy_01`.

No mass asset production before both vertical slices demonstrate the contract.

---

## 19. Asset creation/procurement acceptance

Any sourced or generated model must be judged on:
- topology;
- rig compatibility;
- morph compatibility;
- style;
- license;
- texture quality;
- material separation;
- mobile cost;
- editability;
- visual match to the other production assets.

Do not buy/source an asset merely because it looks good in its marketplace render.

Require raw or inspectable geometry before it enters the production registry.

---

## 20. Procedural generator policy

The repo contains a comprehensive procedural GLB generator.

Use it for:
- test fixtures;
- configuration verification;
- fallback/prototyping where explicitly labeled;
- automated pipeline tests.

Do not automatically treat its procedurally assembled geometry/VFX as final Tier-0 visual authority.

Production Avatar Creator should prefer approved authored meshes and materials.

The procedural system may remain valuable as infrastructure without becoming the visual product.

---

## 21. Owner visual review packet

When Avatar Creator reaches owner review, provide captures of:

### Female
- default full body;
- default face;
- 3/4;
- profile;
- soft/curvy variant;
- athletic/strong variant;
- 3 distinct hairstyles;
- 3 outfits;
- light/medium/deep skin.

### Male
- same equivalent set.

### Creator
- desktop full creator;
- desktop face edit;
- mobile full-body;
- mobile face edit;
- outfit selection;
- save success;
- loading;
- recoverable asset failure.

### Commander
- saved avatar card/full presentation;
- fallback state.

Each capture should identify:
- viewport;
- quality tier;
- selected preset/config;
- asset IDs.

---

## 22. Final visual acceptance questions

Owner should be able to answer "yes" to all:

1. Would I willingly spend time creating a character here?
2. Does the base face already look attractive before customization?
3. Can I make characters that feel substantially different?
4. Does the body feel human and well proportioned from every angle?
5. Does the hair feel authored rather than attached?
6. Do clothes feel made for the same bodies/world?
7. Does the creator look like Otaku-mori rather than a plugin?
8. Is the mobile experience still desirable?
9. Does Commander preserve the same identity?
10. Would I be comfortable showing this as a flagship feature in a launch trailer?

If any answer is "no", Avatar Creator is not visually closed.

---

## 23. First launch roster recommendation

### Base meshes
- Female v1
- Male v1

### Hair
- Long Layered
- Long Straight
- Wolf/Shag
- Bob
- Short Textured
- Ponytail
- Updo
- Asymmetric Alt

### Outfit families
- Minimal Dark
- Structured Commander
- Gothic Formal
- Urban Fantasy

### Signature accessories
- bronze hairpin
- choker
- pendant
- glasses
- earrings
- cuff

This is deliberately small enough to polish to a high standard.

---

## 24. Production order

1. Female base sculpt/topology
2. Male base sculpt/topology
3. Canonical skeleton + deformation proof
4. Face morph set
5. Body morph set
6. Skin/eye material system
7. One female hair + one male/unisex hair
8. One morph-safe outfit each
9. Creator vertical slice
10. Persistence round-trip
11. Commander integration
12. Mobile performance proof
13. Expand hair library
14. Expand wardrobe
15. Expand makeup/markings/accessories
16. Owner review
17. Final optimization
18. Lock Avatar Production v1