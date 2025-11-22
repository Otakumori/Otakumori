# 🎨 CREATOR System - Comprehensive Plan

## Sexier than Nikke, More Comprehensive than Code Vein

### 🎯 **Vision Statement**

Create the most comprehensive, visually stunning, and user-friendly avatar creator system that surpasses Nikke's visual appeal and Code Vein's customization depth. The CREATOR will be the centerpiece of the Otaku-mori experience, allowing users to craft their perfect character with unprecedented detail and control.

---

## 📋 **System Architecture**

### **1. CREATOR UI Components**

#### **Main Creator Interface** (`app/creator/page.tsx`)

- **Full-screen immersive experience** - Dark glass theme with pink/purple accents
- **Three-panel layout**:
  - **Left Panel**: Category navigation (Body, Face, Hair, Clothing, Accessories, NSFW)
  - **Center Panel**: Real-time 3D preview with camera controls
  - **Right Panel**: Slider controls and part selection
- **Top toolbar**: Save, Load, Export, Share, Presets, Undo/Redo
- **Bottom status bar**: Performance metrics, save status, tips

#### **Advanced Slider System** (`components/creator/SliderPanel.tsx`)

- **Category-based organization**:
  - **Body**: Height, Weight, Muscle Mass, Body Fat, Shoulder Width, Waist, Hips, Chest, Thighs, Calves, Arms
  - **Face**: Face Shape, Jawline, Cheekbones, Chin, Eye Size, Eye Spacing, Eye Height, Eye Angle, Nose Size/Width/Height, Mouth Size/Width, Lip Thickness
  - **Hair**: Style, Length, Volume, Texture, Color (Primary/Secondary/Gradient), Highlights
  - **Skin**: Tone, Texture, Blemishes, Freckles, Age Spots, Wrinkles, Glossiness
  - **NSFW**: Anatomy detail, Arousal indicators, Interaction level (gated)
- **Slider features**:
  - **Visual feedback**: Real-time preview updates
  - **Preset buttons**: Quick values (Min, 25%, 50%, 75%, Max)
  - **Linked sliders**: Some sliders affect others (e.g., Weight affects Body Fat)
  - **Range indicators**: Visual min/max bounds
  - **Value display**: Current value with unit (cm, %, etc.)
  - **Haptic feedback**: Subtle vibration on mobile
  - **Sound effects**: Click sounds for slider changes

#### **Part Selection System** (`components/creator/PartSelector.tsx`)

- **Grid-based part browser**:
  - **Thumbnail previews**: High-quality preview images
  - **Category filters**: Filter by type, rarity, content rating
  - **Search functionality**: Real-time search with autocomplete
  - **Favorites**: Star parts for quick access
  - **Recently used**: Quick access to recently selected parts
- **Part information**:
  - **Name and description**
  - **Rarity indicator** (Common, Rare, Epic, Legendary)
  - **Content rating** (SFW, NSFW, Explicit)
  - **Compatibility check**: Shows conflicts with current parts
  - **Preview on hover**: 3D preview of part on avatar

#### **3D Preview System** (`components/creator/AvatarPreview3D.tsx`)

- **Real-time rendering**:
  - **60fps target**: Smooth, responsive preview
  - **Multiple camera presets**: Front, Side, Back, Top, Bottom, Free Orbit
  - **Zoom controls**: Mouse wheel, pinch gesture
  - **Rotation**: Click and drag, touch gestures
  - **Reset button**: Return to default camera position
- **Lighting presets**:
  - **Studio**: Even lighting for customization
  - **Natural**: Outdoor lighting simulation
  - **Dramatic**: High contrast for showcasing
  - **Anime**: Cel-shaded lighting style
- **Background options**:
  - **Solid colors**: Black, white, gray, pink, purple
  - **Gradients**: Custom gradient backgrounds
  - **HDR environments**: Sky, studio, outdoor scenes
  - **Transparent**: For export with transparency

#### **Pose & Animation System** (`components/creator/PoseSelector.tsx`)

- **Pose presets**:
  - **Idle**: Standing, relaxed, confident
  - **Action**: Running, jumping, attacking
  - **Emote**: Happy, sad, angry, surprised
  - **Dance**: Various dance animations
  - **NSFW**: Adult poses (gated)
- **Animation controls**:
  - **Play/Pause**: Control animation playback
  - **Speed**: Adjust animation speed (0.5x, 1x, 2x)
  - **Loop**: Toggle looping
  - **Frame scrubber**: Jump to specific frame

---

### **2. Avatar Data Structure**

#### **Complete Avatar Configuration** (`app/lib/creator/types.ts`)

```typescript
interface CreatorAvatarConfig {
  // Metadata
  id: string;
  userId: string;
  name: string;
  version: string; // Schema version for migration
  createdAt: Date;
  updatedAt: Date;

  // Base model
  baseModel: 'male' | 'female' | 'custom';
  baseModelUrl?: string;

  // Body morphs (0.0 to 1.0, normalized)
  body: {
    // Overall proportions
    height: number; // 0.7 to 1.3
    weight: number; // 0.4 to 1.6
    muscleMass: number; // 0.0 to 1.0
    bodyFat: number; // 0.0 to 1.0

    // Torso
    shoulderWidth: number; // 0.7 to 1.4
    chestSize: number; // 0.6 to 1.4
    waistSize: number; // 0.6 to 1.3
    hipWidth: number; // 0.7 to 1.4

    // Limbs
    armLength: number; // 0.8 to 1.2
    legLength: number; // 0.8 to 1.3
    thighSize: number; // 0.7 to 1.3
    calfSize: number; // 0.7 to 1.2

    // Head
    headSize: number; // 0.8 to 1.2
    neckLength: number; // 0.7 to 1.3
  };

  // Face morphs
  face: {
    // Overall shape
    faceShape: number; // 0.0 to 1.0
    jawline: number; // 0.0 to 1.0
    cheekbones: number; // 0.0 to 1.0
    chinShape: number; // 0.0 to 1.0

    // Eyes
    eyeSize: number; // 0.7 to 1.3
    eyeSpacing: number; // 0.8 to 1.2
    eyeHeight: number; // 0.8 to 1.2
    eyeAngle: number; // -0.3 to 0.3
    eyelidShape: number; // 0.0 to 1.0
    eyeColor: string; // Hex color

    // Eyebrows
    eyebrowThickness: number; // 0.5 to 1.5
    eyebrowAngle: number; // -0.2 to 0.2

    // Nose
    noseSize: number; // 0.7 to 1.3
    noseWidth: number; // 0.7 to 1.3
    noseHeight: number; // 0.8 to 1.2
    bridgeWidth: number; // 0.5 to 1.3
    nostrilSize: number; // 0.7 to 1.3
    noseTip: number; // 0.0 to 1.0

    // Mouth
    mouthSize: number; // 0.7 to 1.3
    mouthWidth: number; // 0.8 to 1.2
    lipThickness: number; // 0.5 to 1.5
    lipShape: number; // 0.0 to 1.0
    cupidBow: number; // 0.0 to 1.0
    mouthAngle: number; // -0.2 to 0.2
  };

  // Skin
  skin: {
    tone: string; // Hex color
    texture: number; // 0.0 to 1.0
    blemishes: number; // 0.0 to 1.0
    freckles: number; // 0.0 to 1.0
    ageSpots: number; // 0.0 to 1.0
    wrinkles: number; // 0.0 to 1.0
    glossiness: number; // 0.0 to 1.0
  };

  // Hair
  hair: {
    style: string; // Part ID
    length: number; // 0.0 to 1.0
    volume: number; // 0.5 to 1.5
    texture: number; // 0.0 to 1.0
    color: {
      primary: string; // Hex color
      secondary?: string; // Hex color
      gradient: boolean;
    };
    highlights: {
      enabled: boolean;
      color: string; // Hex color
      intensity: number; // 0.0 to 1.0
      pattern: 'streaks' | 'tips' | 'roots' | 'random';
    };
  };

  // Parts (40+ equipment slots)
  parts: {
    // Head & Face
    Head?: string;
    Face?: string;
    Eyes?: string;
    Eyebrows?: string;
    Nose?: string;
    Mouth?: string;
    Ears?: string;

    // Hair & Facial
    Hair?: string;
    FacialHair?: string;
    Eyelashes?: string;

    // Body
    Torso?: string;
    Chest?: string;
    Arms?: string;
    Hands?: string;
    Legs?: string;
    Feet?: string;

    // Clothing
    Underwear?: string;
    InnerWear?: string;
    OuterWear?: string;
    Pants?: string;
    Shoes?: string;
    Gloves?: string;

    // Accessories
    Headwear?: string;
    Eyewear?: string;
    Neckwear?: string;
    Earrings?: string;
    Bracelets?: string;
    Rings?: string;

    // Fantasy/Anime
    Horns?: string;
    Tail?: string;
    Wings?: string;
    AnimalEars?: string;
    Halo?: string;

    // Back & Weapons
    Back?: string;
    WeaponPrimary?: string;
    WeaponSecondary?: string;
    Shield?: string;

    // NSFW (gated)
    NSFWChest?: string;
    NSFWGroin?: string;
    NSFWAccessory?: string;
  };

  // Materials
  materials: {
    shader: 'AnimeToon' | 'Realistic' | 'CelShaded' | 'Stylized';
    parameters: {
      glossStrength: number;
      rimStrength: number;
      colorA: string;
      colorB: string;
      rimColor: string;
      metallic: number;
      roughness: number;
    };
    textures?: {
      albedo?: string;
      normal?: string;
      orm?: string;
      mask?: string;
      decals?: string;
    };
  };

  // Physics (for games)
  physics: {
    softBody: {
      enable: boolean;
      mass: number;
      stiffness: number;
      damping: number;
      maxDisplacement: number;
    };
    clothSim: {
      enable: boolean;
      bendStiffness: number;
      stretchStiffness: number;
      damping: number;
      wind: number;
    };
  };

  // NSFW (gated)
  nsfw?: {
    enabled: boolean;
    features: {
      anatomyDetail: number;
      arousalIndicators: boolean;
      interactionLevel: 'none' | 'basic' | 'advanced' | 'explicit';
    };
  };
}
```

---

### **3. Avatar Loading System**

#### **Loading Flow**

```
1. User opens game/mini-game
   ↓
2. Check if user has avatar config
   ├─ Yes → Load from database (User.avatarConfig)
   └─ No → Use default avatar or show creator prompt
   ↓
3. Resolve avatar parts (equipment IDs → URLs)
   ├─ Check NSFW policy (cookie + Clerk verification)
   ├─ Filter NSFW parts if not allowed
   └─ Resolve fallbacks for missing parts
   ↓
4. Load 3D models (GLTF/GLB)
   ├─ Cache in memory (LRU cache)
   ├─ Apply morph targets
   ├─ Apply materials
   └─ Attach parts to skeleton
   ↓
5. Render avatar in game context
   ├─ Apply game-specific representation mode
   ├─ Set up camera/lighting
   └─ Start animations
```

#### **Caching Strategy**

- **Memory Cache**:
  - LRU cache for loaded models (max 50 models)
  - Cache key: `partId + morphHash + materialHash`
  - TTL: 5 minutes of inactivity
- **IndexedDB Cache**:
  - Persistent cache for frequently used parts
  - Cache key: `partId + version`
  - Max size: 500MB
- **CDN Cache**:
  - Static assets cached at CDN level
  - Cache-Control: `public, max-age=31536000, immutable`

#### **Loading Optimization**

- **Progressive Loading**:
  1. Load base model first (skeleton + base mesh)
  2. Load critical parts (head, body, hair)
  3. Load secondary parts (clothing, accessories)
  4. Load tertiary parts (weapons, effects)
- **LOD System**:
  - **High**: Full detail (creator, close-up games)
  - **Medium**: Reduced polygons (most games)
  - **Low**: Minimal detail (background, many avatars)
- **Texture Streaming**:
  - Load low-res textures first
  - Stream high-res textures in background
  - Use texture compression (KTX2, Basis)

---

### **4. Game Integration**

#### **Game-Specific Avatar Loading**

Each game will have a `useGameAvatar()` hook:

```typescript
// app/mini-games/_shared/useGameAvatar.ts
export function useGameAvatar(gameId: string) {
  const { data: avatarConfig } = useQuery({
    queryKey: ['avatar', 'user'],
    queryFn: () => loadAvatarConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const visualProfile = getGameVisualProfile(gameId);
  const representationMode = visualProfile.avatarRepresentationMode;

  return {
    config: avatarConfig,
    representationMode,
    isLoading: !avatarConfig,
    error: null,
  };
}
```

#### **Representation Modes**

- **fullBody**: Complete 3D model (petal-samurai, otaku-beat-em-up, thigh-coliseum)
- **bust**: Upper body only (petal-storm-rhythm, dungeon-of-desire)
- **portrait**: Head and shoulders (memory-match, puzzle-reveal)
- **chibi**: Stylized small version (bubble-girl, blossomware)

#### **Game Integration Points**

1. **Game Page** (`app/mini-games/[game]/page.tsx`):
   - Load avatar config on mount
   - Render avatar with appropriate representation mode
   - Position avatar based on game layout

2. **Game Component** (`app/mini-games/[game]/Game.tsx`):
   - Use avatar as main character
   - Apply game-specific animations
   - Handle avatar interactions (if applicable)

3. **HUD Integration**:
   - Show avatar in HUD (if Quake HUD enabled)
   - Display avatar stats/health (if applicable)

---

### **5. API Routes**

#### **Save Avatar** (`app/api/v1/creator/save/route.ts`)

- **POST** `/api/v1/creator/save`
- **Body**: `CreatorAvatarConfig`
- **Response**: `{ ok: true, data: { avatarId, savedAt } }`
- **Features**:
  - Validate avatar config
  - Check NSFW policy
  - Save to database (User.avatarConfig)
  - Generate avatar bundle
  - Return success response

#### **Load Avatar** (`app/api/v1/creator/load/route.ts`)

- **GET** `/api/v1/creator/load`
- **Response**: `{ ok: true, data: CreatorAvatarConfig }`
- **Features**:
  - Load from database
  - Resolve parts (equipment IDs → URLs)
  - Filter NSFW content based on policy
  - Return avatar config

#### **Export Avatar** (`app/api/v1/creator/export/route.ts`)

- **POST** `/api/v1/creator/export`
- **Body**: `{ format: 'glb' | 'gltf' | 'fbx', includePhysics: boolean }`
- **Response**: `{ ok: true, data: { downloadUrl, expiresAt } }`
- **Features**:
  - Generate 3D model file
  - Upload to Vercel Blob
  - Return download URL (expires in 24 hours)

---

### **6. UI/UX Enhancements**

#### **Visual Polish**

- **Glass morphism**: Dark glass panels with backdrop blur
- **Smooth animations**: 60fps transitions
- **Haptic feedback**: Subtle vibrations on mobile
- **Sound effects**: Click sounds for interactions
- **Loading states**: Skeleton screens, progress indicators
- **Error handling**: Friendly error messages with retry

#### **Accessibility**

- **Keyboard navigation**: Full keyboard support
- **Screen reader**: ARIA labels and descriptions
- **High contrast**: Support for high contrast mode
- **Reduced motion**: Respect `prefers-reduced-motion`
- **Focus management**: Proper focus indicators

#### **Performance**

- **Lazy loading**: Load parts on demand
- **Virtual scrolling**: For long part lists
- **Debounced updates**: Prevent excessive re-renders
- **Memoization**: Cache expensive computations
- **Web Workers**: Offload heavy processing

---

### **7. Implementation Phases**

#### **Phase 1: Core Creator UI** (Week 1)

- [ ] Main creator page layout
- [ ] Slider panel component
- [ ] Part selector component
- [ ] 3D preview component
- [ ] Basic save/load functionality

#### **Phase 2: Advanced Features** (Week 2)

- [ ] Pose/animation system
- [ ] Material customization
- [ ] Export functionality
- [ ] Preset system
- [ ] Undo/redo system

#### **Phase 3: Game Integration** (Week 3)

- [ ] Avatar loading system
- [ ] Caching implementation
- [ ] Game-specific hooks
- [ ] Representation mode rendering
- [ ] Performance optimization

#### **Phase 4: Polish & Testing** (Week 4)

- [ ] UI/UX refinements
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Documentation

---

### **8. Success Metrics**

- **Visual Quality**: Rivals or exceeds Nikke/Code Vein
- **Customization Depth**: 100+ sliders, 40+ equipment slots
- **Performance**: 60fps in creator, <3s load time
- **User Satisfaction**: Intuitive, enjoyable to use
- **Game Integration**: Seamless avatar loading in all games

---

## 🎉 **Conclusion**

This CREATOR system will be the most comprehensive avatar creation tool in the Otaku-mori ecosystem, providing users with unprecedented control over their character's appearance while maintaining excellent performance and user experience.
