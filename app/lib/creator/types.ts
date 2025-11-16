/**
 * CREATOR System Types
 * Comprehensive avatar configuration types for the CREATOR system
 */

export interface CreatorAvatarConfig {
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

export interface SliderConfig {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  category: 'body' | 'face' | 'hair' | 'skin' | 'nsfw';
  description?: string;
  linkedSliders?: string[]; // IDs of sliders that affect this one
  onChange: (value: number) => void;
}

export interface PartCategory {
  id: string;
  label: string;
  icon?: string;
  parts: AvatarPart[];
}

export interface AvatarPart {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl: string;
  previewUrl?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  contentRating: 'sfw' | 'nsfw' | 'explicit';
  compatibleWith?: string[]; // Part IDs that are compatible
  conflictsWith?: string[]; // Part IDs that conflict
}

export interface CameraPreset {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface PosePreset {
  id: string;
  name: string;
  animation: string;
  description: string;
  category: 'idle' | 'action' | 'emote' | 'dance' | 'nsfw';
}

export interface BackgroundPreset {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'environment' | 'studio';
  value: string;
  hdrUrl?: string;
}

