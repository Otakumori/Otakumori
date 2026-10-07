import { z } from 'zod';

export const AvatarAssetKind = z.enum([
  'body',
  'head',
  'hair',
  'garment',
  'accessory',
  'anatomy',
  'animation',
  'material-set',
  'environment',
  'retro-proxy',
]);

export const AvatarContentRating = z.enum(['sfw', 'adult']);

export const AvatarBodyRegion = z.enum([
  'head',
  'neck',
  'chest',
  'abdomen',
  'pelvis',
  'upperArmL',
  'upperArmR',
  'lowerArmL',
  'lowerArmR',
  'handL',
  'handR',
  'upperLegL',
  'upperLegR',
  'lowerLegL',
  'lowerLegR',
  'footL',
  'footR',
]);

export const AvatarTextureCodec = z.enum(['uastc', 'etc1s', 'none']);

export const AvatarAssetSource = z
  .object({
    title: z.string().min(1),
    author: z.string().min(1),
    sourceUrl: z.string().url(),
    licenseSpdx: z.string().min(1),
    licenseUrl: z.string().url().optional(),
    acquiredAt: z.string().datetime().optional(),
    sourceSha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
    notes: z.string().optional(),
  })
  .strict();

export const AvatarLodEntry = z
  .object({
    url: z.string().min(1),
    triangles: z.number().int().nonnegative(),
    vertices: z.number().int().nonnegative().optional(),
    drawCallsExpected: z.number().int().positive().optional(),
    fileBytes: z.number().int().nonnegative().optional(),
    estimatedGpuBytes: z.number().int().nonnegative().optional(),
  })
  .strict();

export const AvatarTextureEntry = z
  .object({
    id: z.string().min(1),
    url: z.string().min(1),
    semantic: z.enum([
      'baseColor',
      'normal',
      'orm',
      'emissive',
      'alpha',
      'faceSdf',
      'mask',
      'other',
    ]),
    codec: AvatarTextureCodec,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    fileBytes: z.number().int().nonnegative().optional(),
    estimatedGpuBytes: z.number().int().nonnegative().optional(),
  })
  .strict();

export const AvatarPhysicsProfile = z
  .object({
    solver: z.enum(['none', 'spring-bone']),
    boneNames: z.array(z.string().min(1)).max(64).default([]),
    collisionProfileId: z.string().min(1).optional(),
    updateHz: z.number().int().min(15).max(60).default(30),
  })
  .strict();

export const AvatarAssetManifestV2 = z
  .object({
    schemaVersion: z.literal(2),
    assetId: z.string().regex(/^[a-z0-9][a-z0-9-]{2,127}$/),
    kind: AvatarAssetKind,
    displayName: z.string().min(1).max(120),
    rigId: z.literal('OM_Humanoid_v1').nullable(),
    bodyFamilies: z.array(z.enum(['feminine-01', 'masculine-01'])).min(1),

    lods: z
      .object({
        lod0: AvatarLodEntry.optional(),
        lod1: AvatarLodEntry.optional(),
        lod2: AvatarLodEntry,
        retro: AvatarLodEntry.optional(),
      })
      .strict(),

    textures: z.array(AvatarTextureEntry).default([]),
    materialFamily: z
      .enum(['skin', 'face', 'hair', 'eye', 'cloth', 'metal', 'accessory', 'retro'])
      .optional(),

    supportedMorphs: z.array(z.string().min(1)).default([]),
    correctiveMorphs: z.array(z.string().min(1)).default([]),
    occludes: z.array(AvatarBodyRegion).default([]),
    attachmentSocket: z.string().min(1).optional(),
    physics: AvatarPhysicsProfile.optional(),

    contentRating: AvatarContentRating,
    contentTags: z.array(z.string().min(1)).default([]),

    source: AvatarAssetSource,

    immutableRevision: z.string().min(1),
    generatedAt: z.string().datetime(),
  })
  .strict()
  .superRefine((manifest, ctx) => {
    if (
      manifest.kind !== 'environment' &&
      manifest.kind !== 'material-set' &&
      manifest.kind !== 'animation' &&
      manifest.rigId === null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rigId'],
        message: 'Renderable character assets must declare the canonical rigId',
      });
    }

    if (manifest.kind === 'retro-proxy' && !manifest.lods.retro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lods', 'retro'],
        message: 'retro-proxy assets require a retro delivery entry',
      });
    }
  });

export type AvatarAssetManifestV2Type = z.infer<typeof AvatarAssetManifestV2>;
export type AvatarAssetKindType = z.infer<typeof AvatarAssetKind>;
export type AvatarBodyRegionType = z.infer<typeof AvatarBodyRegion>;
