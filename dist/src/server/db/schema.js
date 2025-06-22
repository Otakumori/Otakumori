'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.verificationTokens =
  exports.sessionsRelations =
  exports.sessions =
  exports.accountsRelations =
  exports.accounts =
  exports.usersRelations =
  exports.users =
  exports.posts =
  exports.createTable =
    void 0;
const drizzle_orm_1 = require('drizzle-orm');
const pg_core_1 = require('drizzle-orm/pg-core');
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
exports.createTable = (0, pg_core_1.pgTableCreator)(name => `Otaku-mori_${name}`);
exports.posts = (0, exports.createTable)(
  'post',
  d => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => exports.users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default((0, drizzle_orm_1.sql)`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  t => [
    (0, pg_core_1.index)('created_by_idx').on(t.createdById),
    (0, pg_core_1.index)('name_idx').on(t.name),
  ]
);
exports.users = (0, exports.createTable)('user', d => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: 'date',
      withTimezone: true,
    })
    .default((0, drizzle_orm_1.sql)`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
  accounts: many(exports.accounts),
}));
exports.accounts = (0, exports.createTable)(
  'account',
  d => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => exports.users.id),
    type: d.varchar({ length: 255 }).$type().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  t => [
    (0, pg_core_1.primaryKey)({ columns: [t.provider, t.providerAccountId] }),
    (0, pg_core_1.index)('account_user_id_idx').on(t.userId),
  ]
);
exports.accountsRelations = (0, drizzle_orm_1.relations)(exports.accounts, ({ one }) => ({
  user: one(exports.users, { fields: [exports.accounts.userId], references: [exports.users.id] }),
}));
exports.sessions = (0, exports.createTable)(
  'session',
  d => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => exports.users.id),
    expires: d.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  }),
  t => [(0, pg_core_1.index)('t_user_id_idx').on(t.userId)]
);
exports.sessionsRelations = (0, drizzle_orm_1.relations)(exports.sessions, ({ one }) => ({
  user: one(exports.users, { fields: [exports.sessions.userId], references: [exports.users.id] }),
}));
exports.verificationTokens = (0, exports.createTable)(
  'verification_token',
  d => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  }),
  t => [(0, pg_core_1.primaryKey)({ columns: [t.identifier, t.token] })]
);
