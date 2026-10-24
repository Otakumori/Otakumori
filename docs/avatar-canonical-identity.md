# Avatar canonical identity

## Authority

- Route: `/creator`
- Semantic config: `CreatorAvatarConfig`
- Write: `POST /api/v1/creator/save`
- Read: `GET /api/v1/creator/load`
- Renderer target: `packages/avatar/src/renderer/AvatarRenderer.tsx`
- Current procedural renderers are explicit fallbacks until approved production meshes exist.

Saved content preferences never prove age verification. Adult authorization remains server-derived.

## Route classification

| Path | Class | Contract |
| --- | --- | --- |
| `/creator` | A — canonical | Authenticated edit, save, and reload surface |
| `/character-editor` | B — compatibility | Redirects to `/creator` |
| Community Avatar Creator tab | B — compatibility | Discovery link to `/creator`; no independent editor/write |
| `/adults/editor` (`page.safe.tsx`) | E — retired/non-executable | Not a Next.js route entrypoint |
| Profile/root `AvatarCreator` demos | E — retired | Unreferenced SVG/localStorage demos removed |
| `/api/v1/creator/save` | A — canonical | Sole persisted write authority |
| `/api/v1/creator/load` | A — canonical | Stable `{ data: { config, avatarId, rendering, ... } }` read model |
| `/api/v1/character/config` | B — compatibility | Read delegates to canonical load; write returns `410` |
| `/api/v1/avatar/load` | B — compatibility | Read delegates to canonical load |

## Production asset blockers

The config IDs `female_base_v1`, `male_base_v1`, `medium_wolf_01`, `short_texture_01`,
`commander_combat_01`, and `urban_fantasy_01` are semantic fixture/registry references only.
Real renderer promotion remains blocked on owner-approved, runtime-ready base meshes, morph targets,
hair, outfits, materials, rig/animation compatibility, and performance validation.

### First vertical-slice delivery contract

- Female: `female_base_v1`, `medium_wolf_01`, `commander_combat_01`.
- Male: `male_base_v1`, `short_texture_01`, `urban_fantasy_01`.
- Base morph names: `height`, `weight`, `muscleMass`, `bodyFat`, `shoulderWidth`,
  `chestSize`, `waistSize`, `hipWidth`, `armLength`, `legLength`, `thighSize`,
  `calfSize`, `headSize`, and `neckLength`.
- Face morph names: `faceShape`, `jawline`, `cheekbones`, `chinShape`, `eyeSize`,
  `eyeSpacing`, `eyeHeight`, `eyeAngle`, `eyelidShape`, `eyebrowThickness`,
  `eyebrowAngle`, `noseSize`, `noseWidth`, `noseHeight`, `bridgeWidth`, `nostrilSize`,
  `noseTip`, `mouthSize`, `mouthWidth`, `lipThickness`, `lipShape`, `cupidBow`, and
  `mouthAngle`.
- Skeleton: the `STANDARD_RIG_BONES` contract in `packages/avatar/src/spec.ts`, with `Hips`
  as the rig root and stable bone names across both bases and fitted equipment.
- Attachments: registry IDs resolve server-side for the typed `EquipmentSlot` contract; hair
  attaches to `Head`, outfits are skinned to the shared rig, and hand/back/weapon assets use the
  corresponding stable bone or socket.
- Materials: named `skin`, `eyes`, `hair`, and outfit slots with color-safe PBR materials. Supply
  albedo, normal, and ORM maps; mask maps are required where palette changes are supported.
- Animation minimum: `idle`, `walk`, `run`, `jump`, `fall`, `land`, `attack`, and `emote` mappings
  compatible with both production bases. Reduced-motion rendering must remain stable without them.
- GLBs: each semantic ID must resolve through the production asset registry to a root-relative or
  absolute `baseMeshUrl`/equipment URL. Repository presence alone is not approval.
