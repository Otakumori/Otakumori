'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.authOptions = void 0;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const prisma_adapter_1 = require('@auth/prisma-adapter');
const prisma_1 = require('./prisma');
const credentials_1 = __importDefault(require('next-auth/providers/credentials'));
const google_1 = __importDefault(require('next-auth/providers/google'));
const discord_1 = __importDefault(require('next-auth/providers/discord'));
const bcryptjs_1 = __importDefault(require('bcryptjs'));
exports.authOptions = {
  adapter: (0, prisma_adapter_1.PrismaAdapter)(prisma_1.prisma),
  providers: [
    (0, google_1.default)({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: profile.email?.split('@')[0] || profile.name?.toLowerCase().replace(/\s+/g, ''),
        };
      },
    }),
    (0, discord_1.default)({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null,
          username: profile.username,
        };
      },
    }),
    (0, credentials_1.default)({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma_1.prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) {
          return null;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.username,
          image: user.avatarUrl,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        // Update last active
        await prisma_1.prisma.user.update({
          where: { id: user.id },
          data: { lastActive: new Date() },
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'discord') {
        // Check if user exists
        const existingUser = await prisma_1.prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          // Create new user
          await prisma_1.prisma.user.create({
            data: {
              email: user.email,
              username: user.username || user.email.split('@')[0],
              displayName: user.name,
              avatarUrl: user.image,
              isVerified: true,
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
async function hashPassword(password) {
  return bcryptjs_1.default.hash(password, 12);
}
async function verifyPassword(password, hashedPassword) {
  return bcryptjs_1.default.compare(password, hashedPassword);
}
