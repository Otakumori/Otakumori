# @om/avatar v1.5

Avatar system with expressive morphs, modular equipment, and NSFW-aware safety.

## Features

- **Comprehensive Equipment Slots**: 40+ slots covering head, body, clothing, accessories, fantasy elements, and weapons
- **Expressive Morphs**: Slider-based customization with clamped min/max ranges
- **NSFW Defense-in-Depth**: Schema-level enforcement, server validation, runtime clamping, safe fallbacks
- **Cross-Game Portability**: Same rig works in 3D and 2.5D orthographic views
- **Policy-Agnostic Renderer**: Equipment resolved server-side, renderer receives clean URLs
- **Deterministic Thumbnails**: SVG generation with aggressive caching

## Architecture

### Policy Resolution Flow

```
User Request
    ↓
Cookie + Clerk Verification
    ↓
resolvePolicy() → { nsfwAllowed: boolean }
    ↓
assertRenderable(spec, policy)
    ↓
Equipment IDs → URLs (with fallbacks)
    ↓
AvatarRenderer (no policy logic)
```

### Safety Guarantees

1. **Schema Level**: `nsfwPolicy.allowNudity` locked to `false`
2. **Server Validation**: `assertRenderable()` resolves equipment with fallbacks
3. **Runtime Clamping**: All morph weights clamped to defined ranges
4. **Safe Thumbnails**: Deterministic SVG with whitelisted equipment only

## Equipment Slots

### Head & Face

- `Head`, `Face`, `Eyes`, `Eyebrows`, `Nose`, `Mouth`, `Ears`

### Hair & Facial

- `Hair`, `FacialHair`, `Eyelashes`

### Body Base

- `Torso`, `Chest`, `Arms`, `Hands`, `Legs`, `Feet`

### Clothing Layers

- `Underwear`, `InnerWear`, `OuterWear`, `Pants`, `Shoes`, `Gloves`

### Accessories

- `Headwear`, `Eyewear`, `Neckwear`, `Earrings`, `Bracelets`, `Rings`

### Fantasy/Anime

- `Horns`, `Tail`, `Wings`, `AnimalEars`, `Halo`

### Back & Weapons

- `Back`, `WeaponPrimary`, `WeaponSecondary`, `Shield`

### NSFW (Policy-Gated)

- `NSFWChest`, `NSFWGroin`, `NSFWAccessory`

## Usage

### Creating an Avatar Spec

```typescript
import { createDefaultAvatarSpec, validateAvatar } from '@om/avatar';

const spec = createDefaultAvatarSpec();
spec.equipment = {
  Head: 'asset-head-001',
  Torso: 'asset-torso-basic',
  Hair: 'asset-hair-long',
};
spec.morphWeights = {
  height: 0.7,
  width: 0.5,
};
spec.palette = {
  primary: '#8b5cf6',
  secondary: '#ec4899',
  accent: '#f59e0b',
};

if (validateAvatar(spec)) {
  // Spec is valid
}
```

### Server-Side Validation

```typescript
import { resolvePolicy } from '@om/avatar';
import { assertRenderable, assertPublishable } from '@/lib/avatar/validate';

// Resolve NSFW policy
const policy = resolvePolicy({
  cookieValue: req.cookies.get('nsfw-preference'),
  adultVerified: user?.publicMetadata?.adultVerified,
});

// Validate and resolve equipment (for rendering)
const { resolved, hadNSFWSwaps } = await assertRenderable(spec, policy);

// Or validate for publishing (throws on NSFW when disallowed)
try {
  await assertPublishable(spec, policy);
} catch (error) {
  if (error.code === 'NSFW_NOT_ALLOWED') {
    // Handle NSFW content in safe mode
  }
}
```

### Rendering with React Three Fiber

```typescript
import { Canvas } from '@react-three/fiber';
import { AvatarRenderer } from '@om/avatar';

function AvatarPreview({ spec, resolved }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <AvatarRenderer
        spec={spec}
        resolved={resolved}
        reducedMotion={reducedMotion}
        onLoad={() => console.log('Avatar loaded')}
        onError={(error) => console.error('Avatar error:', error)}
      />
    </Canvas>
  );
}
```

### Serialization

```typescript
import { serializeAvatar, deserializeAvatar } from '@om/avatar';

// Save to database
const json = serializeAvatar(spec);
await db.user.update({ avatarConfig: json });

// Load from database
const loaded = deserializeAvatar(user.avatarConfig);
if (loaded) {
  // Valid spec
}
```

### Morph Clamping

```typescript
import { clampMorph, clampAllMorphs } from '@om/avatar';

// Clamp single morph
const safe = clampMorph(spec, 'height', 1.5); // Returns 1.0

// Clamp all morphs
const clampedSpec = clampAllMorphs(spec);
```

## API Routes

### POST /api/avatar/thumbnail

Generate deterministic SVG thumbnail from spec:

```typescript
const response = await fetch('/api/avatar/thumbnail', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ spec }),
});

const svg = await response.text();
```

### GET /api/avatar/thumbnail?avatarId=xxx

Generate thumbnail from stored avatar:

```typescript
<img src={`/api/avatar/thumbnail?avatarId=${userId}`} alt="Avatar" />
```

## Database Schema

Avatar assets stored in `AvatarPart` table:

```prisma
model AvatarPart {
  id            String  @id @default(cuid())
  type          String  // EquipmentSlot
  name          String
  modelUrl      String  // GLTF/GLB URL (Vercel Blob)
  thumbnailUrl  String
  contentRating String  @default("sfw") // "sfw" | "nsfw"
  isDefault     Boolean @default(false)
  // ... other fields
}
```

## Security

### NSFW Policy

Requires **both** conditions:

1. Cookie preference: `nsfw-preference=enabled`
2. Adult verification: `user.publicMetadata.adultVerified === true`

### Asset Whitelisting

Only these hosts are allowed:

- `assets.otakumori.com`
- `public.blob.vercel-storage.com`

### Fallback Strategy

When equipment resolution fails:

1. Unknown asset ID → fetch default for slot
2. Disallowed host → fetch default for slot
3. NSFW + policy disallows → fetch SFW default for slot
4. No default found → use hardcoded fallback URL

## Cross-Game Compatibility

The same avatar spec works across:

- **3D Games**: Full skeletal animation with R3F
- **2.5D Games**: Orthographic camera with same GLTF models
- **2D Games**: Rendered sprites from fixed camera angles

Standard rig bones ensure consistent attachment points.

## Performance

- **Bundle Size**: < 50KB gzipped (core package)
- **Thumbnail Cache**: Immutable with 1-year cache
- **Fallback Cache**: In-memory LRU cache for default assets
- **Lazy Loading**: Equipment meshes loaded on-demand

## TypeScript

Fully typed with Zod schema validation:

```typescript
import type {
  AvatarSpecV15Type,
  EquipmentSlotType,
  PolicyResult,
  ResolvedEquipment,
} from '@om/avatar';
```

## Testing

Run tests:

```bash
pnpm test
```

Coverage includes:

- Spec validation
- Morph clamping
- Serialization roundtrip
- Policy resolution
- Equipment validation
- Renderer mounting

## License

MIT
