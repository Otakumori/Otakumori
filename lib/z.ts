/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { z } from "zod";

export const Product = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().default(""),
  price: z.number(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  stock: z.number().int().nonnegative().default(0),
});
export type Product = z.infer<typeof Product>;

export const TradeItem = z.object({
  id: z.string(),
  name: z.string(),
  rarity: z.enum(["Common", "Rare", "Legendary"]),
  ownerId: z.string(),
});

export const DSMessage = z.object({
  id: z.string(),
  postSlug: z.string(),
  userId: z.string().nullable(),
  phrase: z.string().min(1).max(80),
  createdAt: z.string(),
  appraisals: z.number().int().nonnegative().default(0),
  disparages: z.number().int().nonnegative().default(0),
});
export type DSMessage = z.infer<typeof DSMessage>;
