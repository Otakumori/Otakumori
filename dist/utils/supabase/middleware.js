'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createClient = void 0;
const ssr_1 = require('@supabase/ssr');
const server_1 = require('next/server');
const createClient = request => {
  // Create an unmodified response
  let supabaseResponse = server_1.NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  const supabase = (0, ssr_1.createServerClient)(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = server_1.NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  return supabaseResponse;
};
exports.createClient = createClient;
