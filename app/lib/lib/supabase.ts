// This file is deprecated and replaced with Prisma
// Stub exports to prevent build errors during migration

console.warn('⚠️ app/lib/lib/supabase.ts is deprecated. Use Prisma instead.');

// Stub exports to prevent build errors
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => ({ data: null, error: null }),
        limit: () => ({ data: [], error: null }),
      }),
    }),
    insert: () => ({ data: null, error: null }),
    upsert: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
} as any;

// Helper function to check if user is admin
export const isAdmin = async (email: string) => {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email);
};
