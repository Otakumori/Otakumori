import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development","test","production"]),
  // Clerk (proxy mode)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(10),
  CLERK_SECRET_KEY: z.string().min(10),
  NEXT_PUBLIC_CLERK_PROXY_URL: z.string().url(),
  CLERK_PROXY_URL: z.string().url(),
  // Optional Clerk URLs
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_CLERK_IS_SATELLITE: z.string().optional(),
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(10),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(10),
  // Printify
  PRINTIFY_API_URL: z.string().url(),
  PRINTIFY_API_KEY: z.string().min(10),
  PRINTIFY_SHOP_ID: z.string().min(1),
  // UI rune glyph style preference (client-side); optional
  NEXT_PUBLIC_RUNE_GLYPH_STYLE: z.enum(['emoji','material','auto']).optional(),
});

export const env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PROXY_URL: process.env.NEXT_PUBLIC_CLERK_PROXY_URL,
  CLERK_PROXY_URL: process.env.CLERK_PROXY_URL,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
  NEXT_PUBLIC_CLERK_IS_SATELLITE: process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  PRINTIFY_API_URL: process.env.PRINTIFY_API_URL,
  PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY,
  PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID,
  NEXT_PUBLIC_RUNE_GLYPH_STYLE: process.env.NEXT_PUBLIC_RUNE_GLYPH_STYLE as any,
});
