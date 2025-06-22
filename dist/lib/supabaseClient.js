'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.supabase = void 0;
const supabase_js_1 = require('@supabase/supabase-js');
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
