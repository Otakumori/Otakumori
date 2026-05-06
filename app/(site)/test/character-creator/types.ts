/**
 * Complete Character Creator Types
 * AAA Quality - Nikke/Code Vein/Cyberpunk Level
 */

export interface FullCharacterConfig {
  // === BASIC INFO ===
  name: string;
  gender: 'female' | 'male' | 'custom';
  physique: 'petite' | 'athletic' | 'curvy' | 'muscular' | 'heavy' | 'custom';
  age: 'teen' | 'young-adult' | 'adult' | 'mature';
  
  // === FULL BODY SLIDERS ===
  body: {
    height: number; // 0.7 - 1.3
    weight: number; // 0.6 - 1.5
    muscularity: number; // 0.0 - 1.0
    bodyFat: number; // 0.0 - 1.0
    posture: number; // 0.0 (slouched) - 1.0 (upright)
  };
  
  // === HEAD & FACE ===
  head: {
    size: number;
    width: number;
    depth: number;
  };
  
  face: {
    shape: 'oval' | 'round' | 'heart' | 'square' | 'diamond' | 'custom';
    cheekbones: number; // Prominence
    jawWidth: number;
    jawDepth: number;
    chinShape: number; // 0.0 (pointed) - 1.0 (square)
    chinProminence: number;
    foreheadHeight: number;
  };
  
  // === EYES ===
  eyes: {
    preset: string; // e.g., 'anime-sparkle', 'realistic', 'cat-eye'
    size: number;
    spacing: number;
    depth: number; // How sunken
    tilt: number; // Angle
    irisSize: number;
    pupilSize: number;
    
    // Colors
    irisColor: string;
    scleraColor: string;
    pupilColor: string;
    
    // Highlights
    highlightStyle: 'single' | 'double' | 'star' | 'heart' | 'none';
    highlightColor: string;
    highlightIntensity: number;
    
    // Lids
    eyelidShape: number;
    eyelashLength: number;
  };
  
  eyebrows: {
    style: string; // preset names
    thickness: number;
    arch: number;
    angle: number;
    color: string;
  };
  
  // === NOSE ===
  nose: {
    width: number;
    height: number;
    length: number;
    bridgeWidth: number;
    bridgeDepth: number;
    tipShape: number;
    nostrilSize: number;
    nostrilFlare: number;
  };
  
  // === MOUTH ===
  mouth: {
    width: number;
    size: number;
    upperLipThickness: number;
    lowerLipThickness: number;
    cornerPosition: number; // -1.0 (frown) to 1.0 (smile)
    philtrumDepth: number;
  };
  
  // === EARS & NECK ===
  ears: {
    size: number;
    angle: number; // From head
    lobeShape: number;
  };
  
  neck: {
    thickness: number;
    length: number;
    adamsApple: number; // For males
  };
  
  // === HAIR SYSTEM ===
  hair: {
    baseStyle: string; // 'long-straight', 'braided', 'twin-tails', etc.
    length: number;
    volume: number;
    
    // Colors
    baseColor: string;
    highlightsEnabled: boolean;
    highlightColor: string;
    highlightPattern: 'streaks' | 'ombre' | 'tips' | 'full';
    splitColor: boolean;
    splitColorRight: string;
    
    // Extensions
    extensions: Array<{
      type: string;
      position: [number, number, number];
      color: string;
    }>;
    
    // Physics
    physicsEnabled: boolean;
    physicsIntensity: number;
  };
  
  // === BODY DETAILS ===
  torso: {
    chestWidth: number;
    chestDepth: number;
    abdomenDefinition: number; // Abs visibility
    waistWidth: number;
    breastSize: number;
    breastShape: number; // 0.0 (round) - 1.0 (teardrop)
    breastSeparation: number;
    breastSag: number;
    pectoralSize: number; // For males
  };
  
  shoulders: {
    width: number;
    angle: number;
    definition: number;
  };
  
  arms: {
    upperArmSize: number; // Bicep/tricep
    forearmSize: number;
    armLength: number;
    shoulderShape: number;
  };
  
  hands: {
    fingerLength: number;
    fingerThickness: number;
    nailLength: number;
    nailColor: string;
  };
  
  hips: {
    width: number;
    depth: number;
    shape: number;
  };
  
  buttocks: {
    size: number;
    shape: number; // 0.0 (flat) - 1.0 (round)
    lift: number;
  };
  
  legs: {
    thighCircumference: number;
    calfSize: number;
    upperLegLength: number;
    lowerLegLength: number;
    kneeDefinition: number;
    thighGap: number;
  };
  
  feet: {
    size: number;
  };
  
  // === SKIN & COMPLEXION ===
  skin: {
    tone: string; // Base color
    
    // Texture
    smoothness: number; // 0.0 (rough) - 1.0 (smooth)
    glossiness: number; // 0.0 (matte) - 1.0 (shiny)
    pores: number;
    
    // Features
    freckles: number;
    freckleColor: string;
    moles: number;
    beautyMarks: Array<{ x: number; y: number; size: number }>;
    
    // Blemishes
    acne: number;
    acneColor: string;
    
    // Variation
    flushedCheeks: number;
    flushedColor: string;
    tanLines: boolean;
  };
  
  // === SCARS & MARKINGS ===
  scars: Array<{
    type: 'slash' | 'burn' | 'surgical' | 'puncture';
    location: string;
    size: number;
    opacity: number;
    color: string;
  }>;
  
  tattoos: Array<{
    design: string;
    location: string;
    size: number;
    color: string;
    opacity: number;
    rotation: number;
  }>;
  
  piercings: Array<{
    type: string;
    location: 'ear' | 'nose' | 'lip' | 'eyebrow' | 'tongue' | 'navel' | 'nipple' | 'genital';
    material: 'silver' | 'gold' | 'black';
    size: number;
  }>;
  
  facialHair: {
    style: 'none' | 'stubble' | 'goatee' | 'full-beard' | 'mustache';
    thickness: number;
    color: string;
  };
  
  bodyHair: {
    chest: number; // Density
    back: number;
    arms: number;
    legs: number;
    color: string;
  };
  
  // === NSFW/ADULT ===
  nsfw: {
    enabled: boolean;
    
    genitals: {
      type: 'vulva' | 'penis' | 'both' | 'none';
      size: number;
      detail: number;
    };
    
    breasts: {
      nippleSize: number;
      nippleShape: number;
      nippleColor: string;
      areolaSize: number;
      areolaColor: string;
    };
    
    pubicHair: {
      style: 'none' | 'trimmed' | 'natural' | 'shaved' | 'styled';
      density: number;
      color: string;
    };
  };
  
  // === OUTFIT SYSTEM ===
  outfit: {
    // Layered system
    innerwear: {
      bra: string | null;
      braColor: string;
      panties: string | null;
      pantiesColor: string;
    };
    
    top: {
      style: string;
      color: string;
      pattern: 'solid' | 'plaid' | 'stripes' | 'animal' | 'gradient';
      patternColor: string;
      metallic: number;
      
      // Per-part coloring
      collarColor: string;
      sleevesColor: string;
      mainColor: string;
    };
    
    bottom: {
      style: string;
      color: string;
      pattern: 'solid' | 'plaid' | 'stripes' | 'animal' | 'gradient';
      patternColor: string;
    };
    
    shoes: {
      style: string;
      color: string;
    };
    
    accessories: Array<{
      id: string;
      type: string;
      position: [number, number, number];
      rotation: [number, number, number];
      scale: number;
      color: string;
      glow: boolean;
      glowColor: string;
    }>;
    
    bloodVeil: {
      style: string;
      color: string;
      visible: boolean;
    };
  };
  
  // === MAKEUP ===
  makeup: {
    foundation: {
      enabled: boolean;
      color: string;
      opacity: number;
    };
    blush: {
      enabled: boolean;
      color: string;
      intensity: number;
      placement: 'cheeks' | 'nose' | 'both';
    };
    eyeshadow: {
      enabled: boolean;
      color: string;
      intensity: number;
      style: 'natural' | 'smokey' | 'dramatic';
    };
    eyeliner: {
      enabled: boolean;
      color: string;
      thickness: number;
      style: 'thin' | 'winged' | 'heavy';
    };
    lipstick: {
      enabled: boolean;
      color: string;
      glossiness: number;
      style: 'natural' | 'bold' | 'gradient';
    };
  };
  
  // === ADVANCED PHYSICS ===
  physics: {
    enabled: boolean;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    
    breast: {
      jiggleIntensity: number;
      jiggleSpeed: number;
      damping: number;
      gravity: number;
    };
    
    butt: {
      jiggleIntensity: number;
      damping: number;
    };
    
    hair: {
      swayIntensity: number;
      windResponse: number;
      damping: number;
    };
    
    clothing: {
      clothPhysics: boolean;
      stiffness: number;
      damping: number;
    };
  };
  
  // === VFX & AURA ===
  vfx: {
    aura: {
      enabled: boolean;
      type: 'glow' | 'mist' | 'particles' | 'elemental';
      color: string;
      intensity: number;
    };
    
    glow: {
      enabled: boolean;
      parts: ('eyes' | 'hair' | 'accessories' | 'skin')[];
      color: string;
      intensity: number;
    };
    
    particles: {
      enabled: boolean;
      type: 'sakura' | 'sparkles' | 'hearts' | 'stars' | 'fire';
      density: number;
      color: string;
    };
  };
  
  // === EXPRESSIONS & ANIMATIONS ===
  expression: {
    default: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'flirty';
    eyebrowAngle: number; // Permanent expression adjustment
    mouthCorners: number; // Permanent smile/frown
  };
  
  animations: {
    idlePose: 'standing' | 'hip-sway' | 'breathing' | 'shy';
    walkStyle: 'normal' | 'confident' | 'cute' | 'seductive';
  };
  
  // === META ===
  meta: {
    createdAt: number;
    updatedAt: number;
    version: string;
    presetBase: string | null;
  };
}

// Preset definitions
export const PHYSIQUE_PRESETS = {
  petite: { height: 0.85, weight: 0.8, muscularity: 0.3, breastSize: 0.7, hipWidth: 0.85 },
  athletic: { height: 1.0, weight: 0.9, muscularity: 0.7, breastSize: 0.9, hipWidth: 1.0 },
  curvy: { height: 0.95, weight: 1.15, muscularity: 0.4, breastSize: 1.3, hipWidth: 1.3 },
  muscular: { height: 1.05, weight: 1.1, muscularity: 0.85, breastSize: 0.8, hipWidth: 1.0 },
  heavy: { height: 0.95, weight: 1.4, muscularity: 0.5, breastSize: 1.2, hipWidth: 1.4 },
};

export const HAIR_STYLES = [
  'short-bob', 'long-straight', 'long-wavy', 'twin-tails', 'ponytail', 'high-ponytail',
  'braided', 'twin-braids', 'messy-bun', 'elegant-updo', 'pixie-cut', 'shoulder-length',
  'curly', 'side-swept', 'hime-cut', 'drill-curls', 'spiky', 'shaggy', 'mohawk', 'bald'
];

export const EYE_HIGHLIGHT_STYLES = [
  'single-dot', 'double-dot', 'star-4', 'star-5', 'heart', 'sparkle', 'cross', 'none'
];

export const MAKEUP_PRESETS = {
  natural: { eyeshadow: '#e4c4a8', blush: '#ffb3ba', lipstick: '#f5a9a9' },
  gothic: { eyeshadow: '#2d1b4e', blush: '#8b5a6f', lipstick: '#8b0000' },
  kawaii: { eyeshadow: '#ffc0cb', blush: '#ffb6c1', lipstick: '#ff69b4' },
  glam: { eyeshadow: '#daa520', blush: '#ff8c94', lipstick: '#dc143c' },
};

export const ACCESSORY_TYPES = [
  // Head
  'glasses', 'sunglasses', 'goggles', 'eyepatch', 'tiara', 'crown', 'cat-ears', 'bunny-ears',
  'headband', 'hair-ribbon', 'flower', 'hat', 'cap', 'beret', 'horns',
  
  // Face
  'face-mask', 'bandage', 'scar', 'tattoo-face',
  
  // Neck
  'choker', 'necklace', 'collar', 'scarf',
  
  // Body
  'wings', 'tail', 'belt', 'holster',
  
  // Arms/Hands
  'bracelet', 'ring', 'gloves', 'arm-band', 'watch',
];

export const CLOTHING_TOPS = [
  'tank-top', 't-shirt', 'crop-top', 'bikini-top', 'bra', 'button-up', 'hoodie',
  'jacket', 'blazer', 'sweater', 'sports-bra', 'off-shoulder', 'dress-top', 'armor'
];

export const CLOTHING_BOTTOMS = [
  'shorts', 'skirt', 'mini-skirt', 'pants', 'jeans', 'leggings', 'bikini-bottom',
  'panties', 'dress-bottom', 'cargo-pants', 'sweatpants', 'hot-pants'
];

export const TATTOO_DESIGNS = [
  'tribal', 'dragon', 'flower', 'skull', 'heart', 'star', 'moon', 'sun',
  'butterfly', 'rose', 'kanji', 'runes', 'geometric', 'cyberpunk-circuits'
];

