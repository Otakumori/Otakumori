import { createClient } from '@supabase/supabase-js';

// Removed import for missing '@/types/supabase'
// import { Database } from '@/types/supabase';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
