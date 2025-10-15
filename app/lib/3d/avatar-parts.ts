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
  | 'body_modifications';

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
