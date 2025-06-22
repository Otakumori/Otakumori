'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.isAdmin = exports.supabase = void 0;
const supabase_js_1 = require('@supabase/supabase-js');
// import { Database } from '@/types/supabase'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
// Helper function to check if user is admin
const isAdmin = async email => {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email);
};
exports.isAdmin = isAdmin;
