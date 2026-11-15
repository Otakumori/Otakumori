#!/usr/bin/env node
/**
 * Disposable, local-only Prisma migration contract. Never point this at Neon.
 *
 * seed: construct only the existing commerce relations the candidate needs.
 * baseline: assert Prisma has resolved either the 23-migration Production
 * baseline or that baseline plus the exact protected beta migration.
 * verify: assert exact candidate applied, postflight schema, and no failed rows.
 *
 * This is NOT a full Production/Neon schema equivalence test.
 */
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'node:fs';

const CANDIDATE = '20261112160000_commerce_persistence_compatibility';
const BETA = '20261102193000_beta_runtime_compatibility';
const betaOnDisk = existsSync(`prisma/migrations/${BETA}/migration.sql`);
const betaExpected = betaOnDisk || process.env.OTM_EXPECT_BETA_BASELINE === '1';
const expectedPort = process.env.OTM_COMMERCE_CONTRACT_PORT ?? '5432';
const mode = process.argv[2];
const direct = process.env.DIRECT_URL;
const pooled = process.env.DATABASE_URL;

if (process.env.CI !== 'true' || !direct || direct !== pooled) {
  throw new Error('Isolated CI database-only contract is required');
}
const target = new URL(direct);
if (
  target.hostname !== '127.0.0.1' ||
  target.port !== expectedPort ||
  target.pathname !== '/neondb' ||
  target.username !== 'otm_ci' ||
  !existsSync(`prisma/migrations/${CANDIDATE}/migration.sql`)
) {
  throw new Error(
    'Refusing to run migration contract outside the exact disposable PostgreSQL target',
  );
}
if (!['seed', 'baseline', 'verify'].includes(mode)) {
  throw new Error('Use seed, baseline, or verify');
}

const prisma = new PrismaClient();

async function inspect() {
  const [row] = await prisma.$queryRawUnsafe(`
    SELECT current_database() AS db,
      to_regclass('public."Order"') IS NOT NULL AS order_present,
      to_regclass('public."PrintifyOrderSync"') IS NOT NULL AS sync_present,
      to_regclass('public."FinancialTransaction"') IS NOT NULL AS ledger_present,
      to_regclass('public."_prisma_migrations"') IS NOT NULL AS prisma_ledger_present
  `);
  if (row.db !== 'neondb') throw new Error('Unexpected local database identity');
  return row;
}

async function run() {
  const state = await inspect();
  if (mode === 'seed') {
    if (
      state.order_present ||
      state.sync_present ||
      state.ledger_present ||
      state.prisma_ledger_present
    ) {
      throw new Error('Seed requires a pristine disposable database');
    }
    for (const table of ['Order', 'OrderItem', 'StripeCustomer', 'WebhookEvent']) {
      await prisma.$executeRawUnsafe(`CREATE TABLE "${table}" ("id" TEXT NOT NULL PRIMARY KEY)`);
    }
    await prisma.$executeRawUnsafe(`INSERT INTO "Order" ("id") VALUES ('contract_order')`);
    await prisma.$executeRawUnsafe(`INSERT INTO "OrderItem" ("id") VALUES ('contract_item')`);
    await prisma.$executeRawUnsafe(
      `INSERT INTO "StripeCustomer" ("id") VALUES ('contract_customer')`,
    );
    await prisma.$executeRawUnsafe(`INSERT INTO "WebhookEvent" ("id") VALUES ('contract_event')`);
    console.log(
      'Seeded four required table stubs and synthetic preserved rows on disposable PostgreSQL',
    );
    return;
  }

  if (!state.prisma_ledger_present) throw new Error('Prisma migration ledger absent');
  const [migration] = await prisma.$queryRawUnsafe(`
    SELECT
      (SELECT count(*)::integer FROM public._prisma_migrations
         WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL) AS successful,
      (SELECT count(*)::integer FROM public._prisma_migrations
         WHERE finished_at IS NULL AND rolled_back_at IS NULL) AS unresolved,
      (SELECT count(*)::integer FROM public._prisma_migrations
         WHERE migration_name = '20261112160000_commerce_persistence_compatibility'
           AND finished_at IS NOT NULL AND rolled_back_at IS NULL) AS candidate_applied,
      (SELECT count(*)::integer FROM public._prisma_migrations
         WHERE migration_name = '20261102193000_beta_runtime_compatibility'
           AND finished_at IS NOT NULL AND rolled_back_at IS NULL) AS beta_applied
  `);

  const expectedBaseline = betaExpected ? 24 : 23;
  const expectedBeta = betaExpected ? 1 : 0;

  if (mode === 'baseline') {
    if (
      migration.successful !== expectedBaseline ||
      migration.unresolved !== 0 ||
      migration.candidate_applied !== 0 ||
      migration.beta_applied !== expectedBeta ||
      state.sync_present ||
      state.ledger_present
    ) {
      throw new Error(
        'Prisma baseline must be the reviewed 23 or exact beta-24 sequence with an absent candidate',
      );
    }
    console.log(
      `Prisma baseline verified: ${expectedBaseline} resolved, no unfinished migrations, candidate absent`,
    );
    return;
  }

  const [post] = await prisma.$queryRawUnsafe(`
    SELECT
      (SELECT count(*)::integer FROM information_schema.columns
       WHERE table_schema = 'public' AND
       ((table_name = 'WebhookEvent' AND column_name = 'updatedAt')
        OR (table_name = 'OrderItem' AND column_name IN ('createdAt','updatedAt'))
        OR (table_name = 'StripeCustomer' AND column_name IN ('createdAt','updatedAt')))) AS timestamp_count,
      (SELECT count(*)::integer FROM information_schema.columns
       WHERE table_schema = 'public' AND column_name = 'updatedAt' AND column_default IS NULL AND
       table_name IN ('WebhookEvent','OrderItem','StripeCustomer','PrintifyOrderSync')) AS updated_without_default,
      (SELECT count(*)::integer FROM information_schema.columns
       WHERE table_schema = 'public' AND column_name = 'createdAt' AND column_default IS NOT NULL AND
       table_name IN ('OrderItem','StripeCustomer','FinancialTransaction','PrintifyOrderSync')) AS created_with_default,
      (SELECT count(*)::integer FROM pg_constraint
       WHERE conname IN ('PrintifyOrderSync_localOrderId_fkey',
                         'FinancialTransaction_orderId_fkey')) AS fkey_count,
      (SELECT count(*)::integer FROM pg_indexes
       WHERE schemaname = 'public' AND
       ((tablename = 'PrintifyOrderSync' AND indexname = 'PrintifyOrderSync_localOrderId_key')
        OR (tablename = 'FinancialTransaction' AND indexname = 'FinancialTransaction_orderId_idx'))) AS index_count,
      ((SELECT count(*)::integer FROM "Order" WHERE "id" = 'contract_order') +
       (SELECT count(*)::integer FROM "OrderItem" WHERE "id" = 'contract_item'
          AND "createdAt" IS NOT NULL AND "updatedAt" IS NOT NULL) +
       (SELECT count(*)::integer FROM "StripeCustomer" WHERE "id" = 'contract_customer'
          AND "createdAt" IS NOT NULL AND "updatedAt" IS NOT NULL) +
       (SELECT count(*)::integer FROM "WebhookEvent" WHERE "id" = 'contract_event'
          AND "updatedAt" IS NOT NULL)) AS preserved_rows
  `);

  if (
    migration.successful !== expectedBaseline + 1 ||
    migration.unresolved !== 0 ||
    migration.candidate_applied !== 1 ||
    migration.beta_applied !== expectedBeta ||
    !state.sync_present ||
    !state.ledger_present ||
    post.timestamp_count !== 5 ||
    post.updated_without_default !== 4 ||
    post.created_with_default !== 4 ||
    post.fkey_count !== 2 ||
    post.index_count !== 2 ||
    post.preserved_rows !== 4
  ) {
    throw new Error('Prisma migration lifecycle or candidate schema contract failed');
  }
  console.log(
    `Prisma migrate deploy certified on disposable PostgreSQL: ${expectedBaseline + 1} applied, zero unfinished, two tables, five columns, Prisma defaults, two FKs, required indexes`,
  );
}

run()
  .catch((error) => {
    console.error('Isolated migration contract failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
