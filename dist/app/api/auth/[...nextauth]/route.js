'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.POST = exports.GET = void 0;
const next_auth_1 = __importDefault(require('next-auth'));
const github_1 = __importDefault(require('next-auth/providers/github'));
const credentials_1 = __importDefault(require('next-auth/providers/credentials'));
const bcryptjs_1 = require('bcryptjs');
const supabase_js_1 = require('@supabase/supabase-js');
const supabase = (0, supabase_js_1.createClient)(
  env.NEXT_PUBLIC_SUPABASE_URL || '',
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);
const handler = (0, next_auth_1.default)({
  providers: [
    (0, github_1.default)({
      clientId: env.GITHUB_ID || '',
      clientSecret: env.GITHUB_SECRET || '',
    }),
    (0, credentials_1.default)({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();
        if (error || !user) {
          throw new Error('No user found with this email');
        }
        const isPasswordValid = await (0, bcryptjs_1.compare)(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});
exports.GET = handler;
exports.POST = handler;
