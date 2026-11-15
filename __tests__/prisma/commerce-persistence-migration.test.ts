import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationPath = join(
  process.cwd(),
  'prisma',
  'migrations',
  '20261112160000_commerce_persistence_compatibility',
  'migration.sql',
);
const migration = readFileSync(migrationPath, 'utf8');

describe('commerce persistence migration contract', () => {
  it('contains only the authorized commerce schema targets', () => {
    expect(migration).toContain('"WebhookEvent"');
    expect(migration).toContain('"OrderItem"');
    expect(migration).toContain('"StripeCustomer"');
    expect(migration).toContain('"FinancialTransaction"');
    expect(migration).toContain('"PrintifyOrderSync"');
    expect(migration).not.toMatch(/\b(?:DROP TABLE|DROP COLUMN|DELETE FROM|UPDATE\s+"public")\b/i);
    expect(migration).not.toContain('IF NOT EXISTS');
    expect(migration.match(/CREATE TABLE/g)).toHaveLength(2);
    expect(
      readdirSync(join(process.cwd(), 'prisma', 'migrations')).filter((name) =>
        name.endsWith('_commerce_persistence_compatibility'),
      ),
    ).toEqual(['20261112160000_commerce_persistence_compatibility']);
  });

  it('preserves both reviewed migration orders without duplicating beta objects', () => {
    expect(migration).toContain('completed_migrations NOT IN (23, 24)');
    expect(migration).toContain('20261102193000_beta_runtime_compatibility');
    expect(migration).not.toMatch(/GameSave|GameSession|PetalShopItem/);
  });

  it('declares the Prisma-compatible keys, constraints, and updatedAt backfill semantics', () => {
    expect(migration).toContain('"FinancialTransaction_orderId_fkey"');
    expect(migration).toContain('ON DELETE SET NULL ON UPDATE CASCADE');
    expect(migration).toContain('"PrintifyOrderSync_localOrderId_key"');
    expect(migration).toContain('ON DELETE CASCADE ON UPDATE CASCADE');
    expect(migration.match(/ALTER COLUMN "updatedAt" DROP DEFAULT/g)).toHaveLength(3);
  });
});
