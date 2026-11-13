#!/usr/bin/env node
/**
 * Disposable, local-only Prisma migration contract. Never point this at Neon.
 *
 * seed: construct only the existing commerce relations the candidate needs.
 * baseline: assert Prisma has resolved the 23 historical migration records.
 * verify: assert exact candidate applied, postflight schema, and no failed rows.
 *
 * This is NOT a full Production/Neon schema equivalence test.
 */
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'node:fs';

const CANDIDATE = '20261112160000_commerce_persistence_compatibility';
const mode = process.argv[2];
const direct = process.env.DIRECT_URL;
const pooled = process.env.DATABASE_URL;

if (process.env.CI !== 'true' || !direct || direct !== pooled) {
  throw new Error('Isolated CI database-only contract is required');
}
const target = new URL(direct);
if (
  target.hostname !== '127.0.0.1' ||
  target.port !== '5432' ||
  target.pathname !== '/neondb' ||
  target.username !== 'otm_ci' ||
  !existsSync(`prisma/migrations/${CANDIDATE}/migration.sql`)
) {
  throw new Error('Refusing to run migration contract outside the exact disposable PostgreSQL target');
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
    if (state.order_present || state.sync_present || state.ledger_present || state.prisma_ledger_present) {
      throw new Error('Seed requires a pristine disposable database');
    }
    for (const table of ['Order', 'OrderItem', 'StripeCustomer', 'WebhookEvent']) {
      await prisma.$executeRawUnsafe(`CREATE TABLE "${table}" ("id" TEXT NOT NULL PRIMARY KEY)`);
    }
    console.log('Seeded the four required existing-model table stubs on disposable PostgreSQL');
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
           AND finished_at IS NOT NULL AND rolled_back_at IS NULL) AS candidate_applied
  `);

  if (mode === 'baseline') {
    if (migration.successful !== 23 || migration.unresolved !== 0 || migration.candidate_applied !== 0 ||
        state.sync_present || state.ledger_present) {
      throw new Error('Prisma baseline must have 23 resolved migrations and an absent candidate');
    }
    console.log('Prisma baseline verified: 23 resolved, no unfinished migrations, candidate absent');
    return;
  }

  const [post] = await prisma.$queryRawUnsafe(`
    SELECT
      (SELECT count(*)::integer FROM information_schema.columns
       WHERE table_schema = 'public' AND
       ((table_name = 'WebhookEvent' AND column_name = 'updatedAt')
        OR (table_name = 'OrderItem' AND column_name IN ('createdAt','updatedAt'))
        OR (table_name = 'StripeCustomer' AND column_name IN ('createdAt','updatedAt')))) AS timestamp_count,
      (SELECT count(*)::integer FROM pg_constraint
       WHERE conname IN ('PrintifyOrderSync_localOrderId_fkey',
                         'FinancialTransaction_orderId_fkey')) AS fkey_count,
      (SELECT count(*)::integer FROM pg_indexes
       WHERE schemaname = 'public' AND
       ((tablename = 'PrintifyOrderSync' AND indexname = 'PrintifyOrderSync_localOrderId_key')
        OR (tablename = 'FinancialTransaction' AND indexname = 'FinancialTransaction_orderId_idx'))) AS index_count
  `);

  if (
    migration.successful !== 24 ||
    migration.unresolved !== 0 ||
    migration.candidate_applied !== 1 ||
    !state.sync_present ||
    !state.ledger_present ||
    post.timestamp_count !== 5 ||
    post.fkey_count !== 2 ||
    post.index_count !== 2
  ) {
    throw new Error('Prisma migration lifecycle or candidate schema contract failed');
  }
  console.log('Prisma migrate deploy certified on disposable PostgreSQL: 24 applied, zero unfinished, two tables, five columns, two FKs, required indexes');
}

run()
  .catch((error) => {
    console.error('Isolated migration contract failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
