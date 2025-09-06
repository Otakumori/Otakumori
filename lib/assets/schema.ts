// DEPRECATED: This component is a duplicate. Use drizzle\schema.ts instead.
import { z } from 'zod';

export const ImageRef = z.object({
  url: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const OGSources = z.object({
  default: ImageRef,
  productTemplate: ImageRef.optional(),
});

export const CategoryBanner = ImageRef;

export type TImageRef = z.infer<typeof ImageRef>;
export type TOGSources = z.infer<typeof OGSources>;
export type TCategoryBanner = z.infer<typeof CategoryBanner>;
