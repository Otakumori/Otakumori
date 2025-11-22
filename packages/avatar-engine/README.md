# @om/avatar-engine

Procedural WebGL Avatar Rendering Engine for Otaku-mori mini-games.

## Overview

The avatar engine provides a complete system for rendering avatars across all mini-games with:

- Procedural texture/material generation
- Runtime avatar assembly from modular parts
- WebGL rendering with React Three Fiber
- 4 representation modes (fullBody, bust, portrait, chibi)
- NSFW layer handling
- Integration layer for all 9 mini-games

## Features

### Procedural Generation

- **Textures**: Skin, fabric, metal, decals (petals, blossoms, runes)
- **Materials**: Cel-shaded anime-style materials with rim lighting
- **Fallbacks**: Automatic procedural avatar generation when assets are missing

### Representation Modes

- **fullBody**: Full height, combat-ready, full rig
- **bust**: Waist-up portrait, ideal for rhythm/dungeon games
- **portrait**: Head/shoulder frame for puzzles/memory match
- **chibi**: Super-deformed style for light/cute games

### Asset Registry

- Scans `/public/assets/**` for `.glb`, `.png`, `.jpg`, `.ktx2` files
- Detects slot from filename (`head_*`, `torso_*`, `legs_*`, `accessory_*`)
- Detects NSFW from path (`/nsfw/` or `/adults/`)
- Computes SHA-256 hash for cache validation
- Generates `scan-results.json` and `registry.json`

## Usage

### Basic Avatar Rendering

```tsx
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { useGameAvatar } from '@om/avatar-engine/gameIntegration';

function MyGame() {
  const { avatarConfig, representationConfig } = useGameAvatar('petal-samurai');

  return <AvatarRenderer profile={avatarConfig} mode={representationConfig.mode} size="medium" />;
}
```

### Game Integration

```tsx
import { useGameAvatar } from '@om/avatar-engine/gameIntegration';

function MyGame() {
  const { avatarConfig, representationConfig, isLoading, error } = useGameAvatar('petal-samurai');

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  // Use avatarConfig and representationConfig
}
```

### Material Creation

```tsx
import { createCelShadedMaterial, skinMaterialProcedural } from '@om/avatar-engine/materials';

// Create cel-shaded material
const material = createCelShadedMaterial({
  baseColor: '#ffdbac',
  rimColor: '#ffffff',
  toonSteps: 4,
});

// Create skin material
const skinMat = skinMaterialProcedural({
  skinTone: '#ffdbac',
  subsurfaceStrength: 0.5,
});
```

## Asset Pipeline

### Scanning Assets

Run the asset scanner to generate `scan-results.json`:

```bash
pnpm assets:scan
```

This scans `/public/assets/**` for:

- 3D models (`.glb`, `.gltf`)
- Textures (`.png`, `.jpg`, `.ktx2`)

### Building Registry

Run the curator to build `registry.json`:

```bash
pnpm assets:curate
```

This:

- Builds registry from scan results
- Finds safe fallbacks per slot
- Validates fallback availability
- Generates procedural fallbacks if needed

### Fallback Behavior

If assets are missing:

1. System logs a warning (development only)
2. Procedural avatar is generated automatically
3. Game continues without crashing
4. No blank/empty avatars are rendered

## Feature Flags

- `AVATARS_ENABLED`: Enable/disable avatar system (default: true, works without login)
- `NSFW_AVATARS_ENABLED`: Enable NSFW layers (default: false, feature flag controlled)

Set via environment variables:

```bash
NEXT_PUBLIC_AVATARS_ENABLED=true
NEXT_PUBLIC_NSFW_AVATARS_ENABLED=false
```

## Game Representation Mapping

Default mapping (can be overridden):

- `petal-samurai` → fullBody
- `otaku-beat-em-up` → fullBody
- `thigh-coliseum` → fullBody
- `petal-storm-rhythm` → bust
- `memory-match` → portrait
- `puzzle-reveal` → portrait
- `bubble-girl` → chibi
- `blossomware` → chibi
- `dungeon-of-desire` → bust

## Visual Style

All materials use cel-shaded anime-style rendering:

- Toon ramp (banded shadows, not noisy)
- Clean specular highlights (graphic, not realistic)
- Rim lighting (anime-style edge glow)
- Outline pass integration

No flat grey materials or realistic PBR materials are used.

## NSFW Layer Handling

- Controlled by `NSFW_AVATARS_ENABLED` feature flag
- Loads in separate layer group
- Decoupled from base body models
- Never breaks SFW mode
- Uses compatible procedural materials

## Performance

- Procedural generation runs without login
- Supports both `AVATARS_ENABLED = true` or `false`
- Cached registry loading
- Efficient material reuse
- Optimized WebGL rendering

## Development

### Building

```bash
cd packages/avatar-engine
pnpm build
```

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

## License

Part of the Otaku-mori project.
