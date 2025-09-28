import { z } from "zod";

export const PhysicsProfile = z.object({
  id: z.string(),
  softBody: z.object({
    enable: z.boolean().default(false),
    mass: z.number().min(0).max(10).default(1.0),
    stiffness: z.number().min(0).max(1).default(0.4),
    damping: z.number().min(0).max(1).default(0.2),
    maxDisplacement: z.number().min(0).max(0.25).default(0.06),
    collision: z.object({
      pelvis: z.boolean().default(true),
      chest: z.boolean().default(true),
      spine: z.boolean().default(true),
      thighs: z.boolean().default(true),
    }).default({}),
  }).default({}),
  clothSim: z.object({
    enable: z.boolean().default(false),
    bendStiffness: z.number().min(0).max(1).default(0.5),
    stretchStiffness: z.number().min(0).max(1).default(0.6),
    damping: z.number().min(0).max(1).default(0.2),
    wind: z.number().min(0).max(2).default(0.0),
    colliders: z.array(z.string()).default([]), // "hips", "chest", "thighL", "thighR"...
  }).default({}),
});

export const SliderSpec = z.object({
  id: z.string(),               // e.g. "body.thighWidth"
  label: z.string(),
  min: z.number(),
  max: z.number(),
  step: z.number().default(0.01),
  default: z.number(),
  affects: z.array(z.string()).default([]), // morph targets or shader params
});

export const Interaction = z.object({
  id: z.string(), // "pose:flair_A", "emote:wink_A", "camera:orbit_slow"
  kind: z.enum(["pose","emote","camera","fx"]).default("pose"),
  intensity: z.number().min(0).max(1).default(0.5),
  gated: z.boolean().default(true),
});

export const MaterialParams = z.object({
  shader: z.enum(["AnimeToon"]).default("AnimeToon"),
  params: z.object({
    glossStrength: z.number().min(0).max(1).default(0.6),
    rimStrength: z.number().min(0).max(1).default(0.35),
    colorA: z.string().optional(), // hex
    colorB: z.string().optional(),
    rimColor: z.string().optional(),
  }).default({}),
});

export const PackAssetUrls = z.object({
  albedo: z.string().url(),
  normal: z.string().url().optional(),
  orm:    z.string().url().optional(),
  mask:   z.string().url().optional(),
  decals: z.string().url().optional(), // optional decals atlas
});

export const AdultPack = z.object({
  slug: z.string(),
  title: z.string(),
  rarity: z.enum(["common","rare","legendary"]).default("rare"),
  type: z.enum(["outfit","accessory","hair","decal"]).default("outfit"),
  isAdultOnly: z.literal(true),
  regionAllowlist: z.array(z.string()).optional(),
  pricePetals: z.number().int().min(0).default(0),
  priceUsdCents: z.number().int().min(0).default(0),
  physicsProfile: PhysicsProfile,
  interactions: z.array(Interaction).default([]),
  materials: MaterialParams,
  layers: z.array(z.string()).default(["outfit"]),
  assets: PackAssetUrls,
  sliders: z.array(SliderSpec).default([]), // pack-level additional sliders
});

export const AdultPacks = z.array(AdultPack);

// Type exports
export type PhysicsProfileType = z.infer<typeof PhysicsProfile>;
export type SliderSpecType = z.infer<typeof SliderSpec>;
export type InteractionType = z.infer<typeof Interaction>;
export type MaterialParamsType = z.infer<typeof MaterialParams>;
export type PackAssetUrlsType = z.infer<typeof PackAssetUrls>;
export type AdultPackType = z.infer<typeof AdultPack>;
export type AdultPacksType = z.infer<typeof AdultPacks>;

// Avatar render bundle for games integration
export const AvatarRenderBundle = z.object({
  albedoUrl: z.string().url().optional(),
  normalUrl: z.string().url().optional(),
  ormUrl: z.string().url().optional(),
  maskUrl: z.string().url().optional(),
  decalsUrl: z.string().url().optional(),
  shader: z.literal("AnimeToon"),
  materialParams: z.object({
    glossStrength: z.number(),
    rimStrength: z.number(),
    colorA: z.string().optional(),
    colorB: z.string().optional(),
    rimColor: z.string().optional(),
  }),
  physics: z.object({
    softBody: z.record(z.any()),
    clothSim: z.record(z.any()),
  }),
  morphs: z.record(z.string(), z.number()), // slider values
});

export type AvatarRenderBundleType = z.infer<typeof AvatarRenderBundle>;

// User gated preferences
export const GatedPrefs = z.object({
  allowSuggestiveOutfits: z.boolean().default(false),
  allowSuggestivePhysics: z.boolean().default(false),
  allowSuggestiveInteractions: z.boolean().default(false),
});

export type GatedPrefsType = z.infer<typeof GatedPrefs>;
