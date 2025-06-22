'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createClient = void 0;
const ssr_1 = require('@supabase/ssr');
const createClient = cookieStore => {
  return (0, ssr_1.createServerClient)(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};
exports.createClient = createClient;
