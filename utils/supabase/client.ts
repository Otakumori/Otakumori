// Disabled during Supabase to Prisma migration
console.warn('⚠️ utils/supabase/client.ts is deprecated. Use Prisma instead.');

// Stub exports to prevent build errors
export const supabase = null;
export const createClient = () => null;