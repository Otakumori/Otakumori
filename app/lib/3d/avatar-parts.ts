import * as THREE from 'three';

// Avatar part types with comprehensive customization options
export type AvatarPartType =
  | 'head'
  | 'face'
  | 'hair'
  | 'body'
  | 'torso'
  | 'arms'
  | 'legs'
  | 'clothing'
  | 'underwear'
  | 'lingerie'
  | 'accessories'
  | 'jewelry'
  | 'weapons'
  | 'nsfw_anatomy'
  | 'intimate_accessories'
  | 'facial_features'
  | 'body_modifications'
  | 'wings'
  | 'tails'
  | 'horns'
  | 'tattoos'
  | 'markings'
  | 'glow_effects'
  | 'particle_effects'
  | 'cosmetic_overlays';

export type PartCategory = 'head' | 'body' | 'clothing' | 'accessories' | 'nsfw' | 'cosmetic';

export type ContentRating = 'sfw' | 'nsfw' | 'explicit';

export interface AvatarPart {
  id: string;
  type: AvatarPartType;
  category: PartCategory;
  name: string;
  description?: string;

  // Asset URLs
  modelUrl: string; // GLTF/GLB file
  thumbnailUrl: string; // Preview image
  iconUrl?: string; // UI icon

  // Metadata
  contentRating: ContentRating;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isDefault: boolean;
  isPremium: boolean;

  // Customization options
  customizable: boolean;
  materialSlots: MaterialSlot[];
  morphTargets?: MorphTarget[];
  attachmentPoints: AttachmentPoint[];

  // Compatibility
  compatibleParts: string[]; // IDs of compatible parts
  conflictsWith: string[]; // IDs of conflicting parts

  // Physics
  physicsEnabled: boolean;
  colliderShape?: 'box' | 'sphere' | 'capsule' | 'mesh';

  // Adult content
  adultContent: boolean;
  ageVerificationRequired: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialSlot {
  name: string;
  type: 'diffuse' | 'normal' | 'roughness' | 'metallic' | 'emission' | 'alpha';
  defaultTexture?: string;
  customizable: boolean;
  colorable: boolean;
  patternable: boolean;
}

export interface MorphTarget {
  name: string;
  min: number;
  max: number;
  defaultValue: number;
  category: 'body' | 'face' | 'anatomy';
  adultContent: boolean;
}

export interface AttachmentPoint {
  name: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  parentBone?: string;
}

export interface TattooLayer {
  id: string;
  name: string;
  textureUrl: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'screen';
  bodyPart: string;
  contentRating: ContentRating;
}

export interface GlowEffect {
  id: string;
  name: string;
  color: THREE.Color;
  intensity: number;
  radius: number;
  animation: 'none' | 'pulse' | 'flicker' | 'wave';
  speed: number;
  bodyPart: string;
}

export interface ParticleEffect {
  id: string;
  name: string;
  particleType: 'sparkles' | 'hearts' | 'stars' | 'flames' | 'ice' | 'lightning';
  color: THREE.Color;
  intensity: number;
  size: number;
  speed: number;
  lifetime: number;
  emissionRate: number;
  bodyPart: string;
  contentRating: ContentRating;
}

export interface TextureOverlay {
  id: string;
  name: string;
  textureUrl: string;
  patternType: 'solid' | 'stripes' | 'polka_dots' | 'floral' | 'geometric' | 'custom';
  color: THREE.Color;
  scale: number;
  rotation: number;
  opacity: number;
  bodyPart: string;
  materialSlot: string;
}

// NSFW-specific anatomy morphing targets
export const NSFW_MORPH_TARGETS: Record<string, MorphTarget> = {
  // Female anatomy
  breast_size: {
    name: 'Breast Size',
    min: 0,
    max: 2,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  breast_separation: {
    name: 'Breast Separation',
    min: -0.5,
    max: 0.5,
    defaultValue: 0,
    category: 'anatomy',
    adultContent: true,
  },
  nipple_size: {
    name: 'Nipple Size',
    min: 0.3,
    max: 2,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  areola_size: {
    name: 'Areola Size',
    min: 0.5,
    max: 2.5,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  buttock_size: {
    name: 'Buttock Size',
    min: 0.5,
    max: 2,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  buttock_shape: {
    name: 'Buttock Shape',
    min: -0.5,
    max: 0.5,
    defaultValue: 0,
    category: 'anatomy',
    adultContent: true,
  },
  vagina_depth: {
    name: 'Vaginal Depth',
    min: 0.7,
    max: 1.5,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  labia_size: {
    name: 'Labia Size',
    min: 0.5,
    max: 2,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  clitoris_size: {
    name: 'Clitoris Size',
    min: 0.5,
    max: 2,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  breast_firmness: {
    name: 'Breast Firmness',
    min: 0.3,
    max: 1.5,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  breast_sag: {
    name: 'Breast Sag',
    min: 0,
    max: 1,
    defaultValue: 0.2,
    category: 'anatomy',
    adultContent: true,
  },
  areola_texture: {
    name: 'Areola Texture',
    min: 0.5,
    max: 2,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  pubic_hair: {
    name: 'Pubic Hair',
    min: 0,
    max: 1,
    defaultValue: 0.5,
    category: 'anatomy',
    adultContent: true,
  },

  // Male anatomy
  penis_length: {
    name: 'Penis Length',
    min: 0.7,
    max: 2,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  penis_girth: {
    name: 'Penis Girth',
    min: 0.8,
    max: 1.8,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  testicle_size: {
    name: 'Testicle Size',
    min: 0.7,
    max: 1.5,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  penis_curve: {
    name: 'Penis Curve',
    min: -0.5,
    max: 0.5,
    defaultValue: 0,
    category: 'anatomy',
    adultContent: true,
  },
  penis_head_size: {
    name: 'Penis Head Size',
    min: 0.8,
    max: 1.5,
    defaultValue: 1,
    category: 'anatomy',
    adultContent: true,
  },
  pubic_hair_male: {
    name: 'Pubic Hair',
    min: 0,
    max: 1,
    defaultValue: 0.5,
    category: 'anatomy',
    adultContent: true,
  },
  muscle_definition: {
    name: 'Muscle Definition',
    min: 0,
    max: 2,
    defaultValue: 1,
    category: 'body',
    adultContent: false,
  },

  // General body morphing
  hip_width: {
    name: 'Hip Width',
    min: 0.7,
    max: 1.5,
    defaultValue: 1,
    category: 'body',
    adultContent: false,
  },
  waist_definition: {
    name: 'Waist Definition',
    min: 0.5,
    max: 1.5,
    defaultValue: 1,
    category: 'body',
    adultContent: false,
  },
  thigh_thickness: {
    name: 'Thigh Thickness',
    min: 0.7,
    max: 1.5,
    defaultValue: 1,
    category: 'body',
    adultContent: false,
  },
  // Facial features (anime-style)
  eye_size: {
    name: 'Eye Size',
    min: 0.8,
    max: 1.8,
    defaultValue: 1.2,
    category: 'face',
    adultContent: false,
  },
  eye_shape: {
    name: 'Eye Shape',
    min: 0.5,
    max: 1.5,
    defaultValue: 1,
    category: 'face',
    adultContent: false,
  },
  cheekbones: {
    name: 'Cheekbone Height',
    min: 0.5,
    max: 1.5,
    defaultValue: 1,
    category: 'face',
    adultContent: false,
  },
  jawline: {
    name: 'Jawline Definition',
    min: 0.5,
    max: 1.5,
    defaultValue: 1,
    category: 'face',
    adultContent: false,
  },
  lip_size: {
    name: 'Lip Size',
    min: 0.7,
    max: 1.5,
    defaultValue: 1,
    category: 'face',
    adultContent: false,
  },
  nose_size: {
    name: 'Nose Size',
    min: 0.7,
    max: 1.3,
    defaultValue: 1,
    category: 'face',
    adultContent: false,
  },
  // Body proportions (anime-style)
  shoulder_width: {
    name: 'Shoulder Width',
    min: 0.7,
    max: 1.5,
    defaultValue: 1,
    category: 'body',
    adultContent: false,
  },
  arm_length: {
    name: 'Arm Length',
    min: 0.8,
    max: 1.2,
    defaultValue: 1,
    category: 'body',
    adultContent: false,
  },
  leg_length: {
    name: 'Leg Length',
    min: 0.8,
    max: 1.3,
    defaultValue: 1,
    category: 'body',
    adultContent: false,
  },
  body_fat: {
    name: 'Body Fat',
    min: 0.3,
    max: 1.5,
    defaultValue: 1,
    category: 'body',
    adultContent: false,
  },
  height: {
    name: 'Height',
    min: 0.8,
    max: 1.2,
    defaultValue: 1,
    category: 'body',
    adultContent: false,
  },
};

// Quality presets for ultra-high quality anime rendering
export const QUALITY_PRESETS: Record<string, QualityPreset> = {
  low: {
    id: 'low',
    name: 'Low Quality',
    textureSize: 512,
    shadowMapSize: 1024,
    samples: 1,
    enablePhysics: false,
    enableAdvancedShaders: false,
    celShadingSteps: 2,
    rimLightIntensity: 0.3,
  },
  medium: {
    id: 'medium',
    name: 'Medium Quality',
    textureSize: 1024,
    shadowMapSize: 2048,
    samples: 2,
    enablePhysics: true,
    enableAdvancedShaders: true,
    celShadingSteps: 3,
    rimLightIntensity: 0.5,
  },
  high: {
    id: 'high',
    name: 'High Quality',
    textureSize: 2048,
    shadowMapSize: 4096,
    samples: 4,
    enablePhysics: true,
    enableAdvancedShaders: true,
    celShadingSteps: 4,
    rimLightIntensity: 0.7,
  },
  ultra: {
    id: 'ultra',
    name: 'Ultra Quality',
    textureSize: 4096,
    shadowMapSize: 8192,
    samples: 8,
    enablePhysics: true,
    enableAdvancedShaders: true,
    celShadingSteps: 5,
    rimLightIntensity: 1.0,
  },
};

// Default cel-shading configuration
export const DEFAULT_CEL_SHADING_CONFIG: CelShadingConfig = {
  enabled: true,
  shadowSteps: 3,
  rimLightColor: '#ffffff',
  rimLightIntensity: 0.5,
  outlineWidth: 0.02,
  outlineColor: '#000000',
};

// Default physics configuration
export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  hairPhysics: true,
  clothPhysics: true,
  bodyPhysics: false,
  physicsQuality: 'high',
  springStiffness: 0.8,
  damping: 0.9,
};

// Adult clothing and accessory categories
export const ADULT_CLOTHING_CATEGORIES = [
  'lingerie',
  'underwear',
  'intimate_accessories',
  'restraints',
  'fetish_wear',
  'cosplay_adult',
  'swimwear_revealing',
] as const;

export const INTIMATE_ACCESSORIES = [
  'vibrators',
  'plugs',
  'restraints',
  'harnesses',
  'collars',
  'piercings',
  'tattoos_intimate',
  'body_paint',
] as const;

// Default avatar parts with NSFW options
export const DEFAULT_AVATAR_PARTS: Partial<Record<AvatarPartType, AvatarPart[]>> = {
  // Base body parts
  body: [
    {
      id: 'base_female',
      type: 'body',
      category: 'body',
      name: 'Female Base Body',
      description: 'Standard female body with customizable anatomy',
      modelUrl: '/assets/models/avatar-base/female-body.glb',
      thumbnailUrl: '/assets/models/avatar-base/female-body-thumb.jpg',
      contentRating: 'sfw',
      rarity: 'common',
      isDefault: true,
      isPremium: false,
      customizable: true,
      materialSlots: [
        { name: 'skin', type: 'diffuse', colorable: true, customizable: true, patternable: false },
        {
          name: 'normal',
          type: 'normal',
          customizable: true,
          colorable: false,
          patternable: false,
        },
        {
          name: 'roughness',
          type: 'roughness',
          customizable: true,
          colorable: false,
          patternable: false,
        },
      ],
      morphTargets: Object.values(NSFW_MORPH_TARGETS).filter((m) => m.category === 'anatomy'),
      attachmentPoints: [
        {
          name: 'head',
          position: new THREE.Vector3(0, 1.8, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
        },
        {
          name: 'chest',
          position: new THREE.Vector3(0, 1.2, 0.3),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
        },
        {
          name: 'waist',
          position: new THREE.Vector3(0, 0.8, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
        },
        {
          name: 'pelvis',
          position: new THREE.Vector3(0, 0.4, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
        },
      ],
      physicsEnabled: true,
      colliderShape: 'capsule',
      adultContent: true,
      ageVerificationRequired: true,
      compatibleParts: [],
      conflictsWith: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'base_male',
      type: 'body',
      category: 'body',
      name: 'Male Base Body',
      description: 'Standard male body with customizable anatomy',
      modelUrl: '/assets/models/avatar-base/male-body.glb',
      thumbnailUrl: '/assets/models/avatar-base/male-body-thumb.jpg',
      contentRating: 'sfw',
      rarity: 'common',
      isDefault: true,
      isPremium: false,
      customizable: true,
      materialSlots: [
        { name: 'skin', type: 'diffuse', colorable: true, customizable: true, patternable: false },
        {
          name: 'normal',
          type: 'normal',
          customizable: true,
          colorable: false,
          patternable: false,
        },
        {
          name: 'roughness',
          type: 'roughness',
          customizable: true,
          colorable: false,
          patternable: false,
        },
      ],
      morphTargets: Object.values(NSFW_MORPH_TARGETS).filter((m) => m.category === 'anatomy'),
      attachmentPoints: [
        {
          name: 'head',
          position: new THREE.Vector3(0, 1.8, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
        },
        {
          name: 'chest',
          position: new THREE.Vector3(0, 1.3, 0.3),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
        },
        {
          name: 'waist',
          position: new THREE.Vector3(0, 0.9, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
        },
        {
          name: 'pelvis',
          position: new THREE.Vector3(0, 0.4, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
        },
      ],
      physicsEnabled: true,
      colliderShape: 'capsule',
      adultContent: true,
      ageVerificationRequired: true,
      compatibleParts: [],
      conflictsWith: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Adult clothing options
  clothing: [
    {
      id: 'lingerie_lace_set',
      type: 'clothing',
      category: 'clothing',
      name: 'Lace Lingerie Set',
      description: 'Delicate lace lingerie with customizable colors',
      modelUrl: '/assets/models/clothing/lingerie-lace-set.glb',
      thumbnailUrl: '/assets/models/clothing/lingerie-lace-thumb.jpg',
      contentRating: 'nsfw',
      rarity: 'rare',
      isDefault: false,
      isPremium: true,
      customizable: true,
      materialSlots: [
        { name: 'fabric', type: 'diffuse', colorable: true, customizable: true, patternable: true },
        { name: 'trim', type: 'diffuse', colorable: true, customizable: true, patternable: false },
        {
          name: 'transparency',
          type: 'alpha',
          customizable: true,
          colorable: false,
          patternable: false,
        },
      ],
      attachmentPoints: [
        {
          name: 'bra',
          position: new THREE.Vector3(0, 1.2, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
        },
        {
          name: 'panties',
          position: new THREE.Vector3(0, 0.4, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
        },
      ],
      physicsEnabled: true,
      adultContent: true,
      ageVerificationRequired: true,
      compatibleParts: [],
      conflictsWith: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  // Intimate accessories
  nsfw_anatomy: [
    {
      id: 'intimate_piercings_set',
      type: 'nsfw_anatomy',
      category: 'nsfw',
      name: 'Intimate Piercings Set',
      description: 'Various intimate piercing options',
      modelUrl: '/assets/models/accessories/intimate-piercings.glb',
      thumbnailUrl: '/assets/models/accessories/piercings-thumb.jpg',
      contentRating: 'explicit',
      rarity: 'epic',
      isDefault: false,
      isPremium: true,
      customizable: true,
      materialSlots: [
        { name: 'metal', type: 'diffuse', colorable: true, customizable: true, patternable: false },
        { name: 'jewel', type: 'diffuse', colorable: true, customizable: true, patternable: false },
        {
          name: 'normal',
          type: 'normal',
          customizable: true,
          colorable: false,
          patternable: false,
        },
      ],
      attachmentPoints: [
        {
          name: 'nipple_left',
          position: new THREE.Vector3(-0.15, 1.15, 0.35),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(0.1, 0.1, 0.1),
        },
        {
          name: 'nipple_right',
          position: new THREE.Vector3(0.15, 1.15, 0.35),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(0.1, 0.1, 0.1),
        },
        {
          name: 'clitoral',
          position: new THREE.Vector3(0, 0.35, 0.1),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(0.05, 0.05, 0.05),
        },
      ],
      physicsEnabled: false,
      adultContent: true,
      ageVerificationRequired: true,
      compatibleParts: [],
      conflictsWith: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

// Avatar configuration interface with NSFW options
// Quality preset configuration
export interface QualityPreset {
  id: string;
  name: string;
  textureSize: 512 | 1024 | 2048 | 4096;
  shadowMapSize: 1024 | 2048 | 4096 | 8192;
  samples: 1 | 2 | 4 | 8;
  enablePhysics: boolean;
  enableAdvancedShaders: boolean;
  celShadingSteps: 2 | 3 | 4 | 5; // Number of shadow steps for cel-shading
  rimLightIntensity: number; // Rim lighting strength
}

// Cel-shading configuration
export interface CelShadingConfig {
  enabled: boolean;
  shadowSteps: number;
  rimLightColor: string;
  rimLightIntensity: number;
  outlineWidth: number;
  outlineColor: string;
}

// Physics configuration
export interface PhysicsConfig {
  hairPhysics: boolean;
  clothPhysics: boolean;
  bodyPhysics: boolean;
  physicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  springStiffness: number;
  damping: number;
}

// NSFW anatomy configuration
export interface NSFWAnatomyConfig {
  enabled: boolean;
  detailed: boolean;
  maleOptions: Record<string, number>;
  femaleOptions: Record<string, number>;
}

export interface AvatarConfiguration {
  id: string;
  userId: string;

  // Base configuration
  baseModel: 'male' | 'female' | 'custom';
  baseModelUrl?: string;

  // Part assignments
  parts: Partial<Record<AvatarPartType, string>>; // part type -> part ID

  // Morphing values
  morphTargets: Record<string, number>; // morph target name -> value

  // Material customizations
  materialOverrides: Record<string, MaterialOverride>;

  // Content settings
  contentRating: ContentRating;
  showNsfwContent: boolean;
  ageVerified: boolean;

  // Animation preferences
  defaultAnimation: string;
  idleAnimations: string[];

  // Export settings
  allowExport: boolean;
  exportFormat: 'glb' | 'gltf' | 'fbx';

  // Quality and rendering settings
  qualityPreset?: string;
  celShadingConfig?: CelShadingConfig;
  physicsConfig?: PhysicsConfig;
  nsfwAnatomyConfig?: NSFWAnatomyConfig;
  advancedMaterialSettings?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialOverride {
  slot: string;
  type: 'color' | 'texture' | 'pattern';
  value: string | THREE.Color;
  opacity?: number;
  metallic?: number;
  roughness?: number;
  normalStrength?: number;
}

// Avatar part management system
export class AvatarPartManager {
  private parts: Map<string, AvatarPart> = new Map();
  private configurations: Map<string, AvatarConfiguration> = new Map();

  constructor() {
    this.initializeDefaultParts();
  }

  private initializeDefaultParts() {
    // Load all default parts
    Object.values(DEFAULT_AVATAR_PARTS).forEach((partList) => {
      partList.forEach((part) => {
        this.parts.set(part.id, part);
      });
    });
  }

  // Part management
  getPart(id: string): AvatarPart | undefined {
    return this.parts.get(id);
  }

  getPartsByType(type: AvatarPartType): AvatarPart[] {
    return Array.from(this.parts.values()).filter((part) => part.type === type);
  }

  getPartsByCategory(category: PartCategory): AvatarPart[] {
    return Array.from(this.parts.values()).filter((part) => part.category === category);
  }

  // NSFW content filtering
  getPartsByRating(rating: ContentRating, userAgeVerified: boolean = false): AvatarPart[] {
    return Array.from(this.parts.values()).filter((part) => {
      if (part.contentRating === 'sfw') return true;
      if (part.contentRating === 'nsfw') return rating !== 'sfw';
      if (part.contentRating === 'explicit') return rating === 'explicit' && userAgeVerified;
      return false;
    });
  }

  // Advanced customization examples
  getWingsParts(): AvatarPart[] {
    return [
      {
        id: 'wings_angel_001',
        type: 'wings',
        category: 'accessories',
        name: 'Angel Wings',
        description: 'Pure white angel wings with soft feathers',
        modelUrl: '/assets/parts/wings/angel_001.glb',
        thumbnailUrl: '/assets/parts/wings/angel_001_thumb.jpg',
        contentRating: 'sfw',
        rarity: 'rare',
        isDefault: false,
        isPremium: true,
        customizable: true,
        materialSlots: [
          {
            name: 'feathers',
            type: 'diffuse',
            customizable: true,
            colorable: true,
            patternable: false,
          },
          {
            name: 'bones',
            type: 'diffuse',
            customizable: true,
            colorable: true,
            patternable: false,
          },
        ],
        attachmentPoints: [
          {
            name: 'back_center',
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(1, 1, 1),
          },
        ],
        compatibleParts: ['body_001', 'body_002'],
        conflictsWith: ['wings_demon_001', 'wings_dragon_001'],
        physicsEnabled: true,
        colliderShape: 'mesh',
        adultContent: false,
        ageVerificationRequired: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'wings_demon_001',
        type: 'wings',
        category: 'accessories',
        name: 'Demon Wings',
        description: 'Dark leathery demon wings with bat-like appearance',
        modelUrl: '/assets/parts/wings/demon_001.glb',
        thumbnailUrl: '/assets/parts/wings/demon_001_thumb.jpg',
        contentRating: 'nsfw',
        rarity: 'epic',
        isDefault: false,
        isPremium: true,
        customizable: true,
        materialSlots: [
          {
            name: 'membrane',
            type: 'diffuse',
            customizable: true,
            colorable: true,
            patternable: true,
          },
          {
            name: 'bones',
            type: 'diffuse',
            customizable: true,
            colorable: true,
            patternable: false,
          },
        ],
        attachmentPoints: [
          {
            name: 'back_center',
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(1, 1, 1),
          },
        ],
        compatibleParts: ['body_001', 'body_002'],
        conflictsWith: ['wings_angel_001', 'wings_dragon_001'],
        physicsEnabled: true,
        colliderShape: 'mesh',
        adultContent: true,
        ageVerificationRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  getTailsParts(): AvatarPart[] {
    return [
      {
        id: 'tail_cat_001',
        type: 'tails',
        category: 'accessories',
        name: 'Cat Tail',
        description: 'Fluffy cat tail with realistic fur',
        modelUrl: '/assets/parts/tails/cat_001.glb',
        thumbnailUrl: '/assets/parts/tails/cat_001_thumb.jpg',
        contentRating: 'sfw',
        rarity: 'common',
        isDefault: false,
        isPremium: false,
        customizable: true,
        materialSlots: [
          { name: 'fur', type: 'diffuse', customizable: true, colorable: true, patternable: true },
        ],
        attachmentPoints: [
          {
            name: 'tail_base',
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(1, 1, 1),
          },
        ],
        compatibleParts: ['body_001', 'body_002'],
        conflictsWith: ['tail_dog_001', 'tail_fox_001'],
        physicsEnabled: true,
        colliderShape: 'capsule',
        adultContent: false,
        ageVerificationRequired: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  getHornsParts(): AvatarPart[] {
    return [
      {
        id: 'horns_demon_001',
        type: 'horns',
        category: 'accessories',
        name: 'Demon Horns',
        description: 'Curved demon horns with metallic finish',
        modelUrl: '/assets/parts/horns/demon_001.glb',
        thumbnailUrl: '/assets/parts/horns/demon_001_thumb.jpg',
        contentRating: 'nsfw',
        rarity: 'rare',
        isDefault: false,
        isPremium: true,
        customizable: true,
        materialSlots: [
          {
            name: 'horn_material',
            type: 'diffuse',
            customizable: true,
            colorable: true,
            patternable: false,
          },
        ],
        attachmentPoints: [
          {
            name: 'head_top',
            position: new THREE.Vector3(0, 0.1, 0),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(1, 1, 1),
          },
        ],
        compatibleParts: ['head_001', 'head_002'],
        conflictsWith: ['horns_unicorn_001'],
        physicsEnabled: false,
        adultContent: true,
        ageVerificationRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // Configuration management
  createConfiguration(userId: string, baseModel: 'male' | 'female'): AvatarConfiguration {
    const config: AvatarConfiguration = {
      id: `config_${Date.now()}`,
      userId,
      baseModel,
      parts: {},
      morphTargets: {},
      materialOverrides: {},
      contentRating: 'sfw',
      showNsfwContent: false,
      ageVerified: false,
      defaultAnimation: 'idle',
      idleAnimations: ['idle', 'idle_2'],
      allowExport: false,
      exportFormat: 'glb',
      qualityPreset: 'high',
      celShadingConfig: { ...DEFAULT_CEL_SHADING_CONFIG },
      physicsConfig: { ...DEFAULT_PHYSICS_CONFIG },
      nsfwAnatomyConfig: {
        enabled: false,
        detailed: false,
        maleOptions: {},
        femaleOptions: {},
      },
      advancedMaterialSettings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.configurations.set(config.id, config);
    return config;
  }

  updateConfiguration(
    configId: string,
    updates: Partial<AvatarConfiguration>,
  ): AvatarConfiguration | undefined {
    const config = this.configurations.get(configId);
    if (!config) return undefined;

    const updatedConfig = { ...config, ...updates, updatedAt: new Date() };
    this.configurations.set(configId, updatedConfig);
    return updatedConfig;
  }

  // Morph target management
  updateMorphTarget(configId: string, targetName: string, value: number): boolean {
    const config = this.configurations.get(configId);
    if (!config) return false;

    const morphTarget = NSFW_MORPH_TARGETS[targetName];
    if (!morphTarget) return false;

    // Clamp value to morph target range
    const clampedValue = Math.max(morphTarget.min, Math.min(morphTarget.max, value));

    config.morphTargets[targetName] = clampedValue;
    config.updatedAt = new Date();

    return true;
  }

  // Compatibility checking
  checkPartCompatibility(
    partId: string,
    configId: string,
  ): { compatible: boolean; conflicts: string[] } {
    const part = this.parts.get(partId);
    const config = this.configurations.get(configId);

    if (!part || !config) return { compatible: false, conflicts: [] };

    const conflicts: string[] = [];

    // Check for explicit conflicts
    part.conflictsWith.forEach((conflictId) => {
      if (config.parts[part.type] === conflictId) {
        conflicts.push(conflictId);
      }
    });

    // Check content rating compatibility
    if (part.contentRating === 'explicit' && !config.ageVerified) {
      conflicts.push('age_verification_required');
    }

    return {
      compatible: conflicts.length === 0,
      conflicts,
    };
  }

  // Export functionality
  async exportAvatar(configId: string): Promise<Blob | null> {
    const config = this.configurations.get(configId);
    if (!config || !config.allowExport) return null;

    // Implementation would generate GLTF/GLB file with all parts and morphing
    // This is a placeholder for the actual export logic
    return null;
  }
}

// Singleton instance
export const avatarPartManager = new AvatarPartManager();
