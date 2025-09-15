import { z } from 'zod';

export const PrintifyProduct = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        id: z.number(),
        title: z.string(),
        price: z.number(),
        available: z.boolean(),
      }),
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const PrintifyProducts = z.array(PrintifyProduct);

export const PrintifyError = z.object({
  error: z.string(),
  detail: z.string().optional(),
});

export type PrintifyProduct = z.infer<typeof PrintifyProduct>;
export type PrintifyProducts = z.infer<typeof PrintifyProducts>;
export type PrintifyError = z.infer<typeof PrintifyError>;
