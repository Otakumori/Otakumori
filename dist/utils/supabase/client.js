'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.query = exports.handleSupabaseError = exports.supabase = void 0;
const supabase_js_1 = require('@supabase/supabase-js');
const env_1 = require('@/env');
if (!env_1.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!env_1.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
exports.supabase = (0, supabase_js_1.createClient)(
  env_1.env.NEXT_PUBLIC_SUPABASE_URL,
  env_1.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
// Helper function to handle Supabase errors
const handleSupabaseError = error => {
  console.error('Supabase Error:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
  if (error.code === 'PGRST301') {
    throw new Error('Authentication required');
  } else if (error.code === 'PGRST302') {
    throw new Error('Permission denied');
  } else if (error.code === 'PGRST303') {
    throw new Error('Resource not found');
  } else {
    throw new Error(`Database error: ${error.message}`);
  }
};
exports.handleSupabaseError = handleSupabaseError;
// Type-safe query helper
const query = async queryFn => {
  try {
    const { data, error } = await queryFn();
    if (error) (0, exports.handleSupabaseError)(error);
    return data;
  } catch (error) {
    (0, exports.handleSupabaseError)(error);
  }
};
exports.query = query;
