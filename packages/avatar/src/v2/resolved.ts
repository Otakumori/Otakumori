import { z } from 'zod';
import { AvatarV2EquipmentSlot } from './spec';

export const ResolvedAvatarAssetV2 = z
  .object({
    assetId: z.string().min(1),
    manifestUrl: z.string().min(1),
    contentRating: z.enum(['sfw', 'adult']),
  })
  .strict();

export const ResolvedAvatarV2 = z
  .object({
    version: z.literal('2.0'),
    rigId: z.literal('OM_Humanoid_v1'),
    bodyAsset: ResolvedAvatarAssetV2,
    headAsset: ResolvedAvatarAssetV2.optional(),
    equipment: z
      .record(AvatarV2EquipmentSlot, ResolvedAvatarAssetV2.nullable())
      .default({}),
    /**
     * Descriptive result of server policy resolution. The client cannot promote
     * itself from safe to adult by modifying AvatarSpecV2.
     */
    policyMode: z.enum(['safe', 'adult']),
    fallbacksApplied: z.array(
      z.object({
        slot: AvatarV2EquipmentSlot,
        requestedAssetId: z.string().nullable(),
        resolvedAssetId: z.string().nullable(),
        reason: z.enum([
          'not-found',
          'incompatible',
          'restricted',
          'unavailable',
        ]),
      }),
    ).default([]),
  })
  .strict();

export type ResolvedAvatarAssetV2Type = z.infer<typeof ResolvedAvatarAssetV2>;
export type ResolvedAvatarV2Type = z.infer<typeof ResolvedAvatarV2>;
