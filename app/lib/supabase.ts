// Disabled during Supabase to Prisma migration
console.warn('⚠️ app/lib/supabase.ts is deprecated. Use Prisma instead.');

// Stub exports to prevent build errors
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => ({ data: null, error: null }),
        limit: () => ({ data: [], error: null })
      })
    }),
    insert: () => ({ data: null, error: null }),
    upsert: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null })
  })
};
