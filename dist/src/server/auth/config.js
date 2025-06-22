'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.authConfig = void 0;
const drizzle_adapter_1 = require('@auth/drizzle-adapter');
const discord_1 = __importDefault(require('next-auth/providers/discord'));
const db_1 = require('~/server/db');
const schema_1 = require('~/server/db/schema');
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
exports.authConfig = {
  providers: [
    discord_1.default,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: (0, drizzle_adapter_1.DrizzleAdapter)(db_1.db, {
    usersTable: schema_1.users,
    accountsTable: schema_1.accounts,
    sessionsTable: schema_1.sessions,
    verificationTokensTable: schema_1.verificationTokens,
  }),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
};
