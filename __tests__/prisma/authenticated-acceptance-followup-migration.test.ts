import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const followupMigrationPath =
  'prisma/migrations/20260728180000_authenticated_acceptance_followup/migration.sql';

const previousMigrationChecksums = new Map([
  [
    'prisma/migrations/20260726160000_authenticated_data_boundary_readiness/migration.sql',
    '47E94ED3D4BDE1188A198C14E6033485F4EE8F58F26C5CF1C4CEA1D9F1757ABA',
  ],
  [
    'prisma/migrations/20260726162000_authenticated_user_updated_at_readiness/migration.sql',
    '3FA85CF11D23F8DFE9C34FA2CD1F3C7FAD6428D264E11547069B0DEB41C11A1E',
  ],
  [
    'prisma/migrations/20260726164000_wallet_timestamp_readiness/migration.sql',
    '35E6DEEB96C083FC758E83AB80013C8EF1AD44FBCEF6779A062A31C96602407F',
  ],
]);

function read(path: string) {
  return readFileSync(path, 'utf8');
}

function sha256(path: string) {
  return createHash('sha256').update(readFileSync(path)).digest('hex').toUpperCase();
}

describe('authenticated acceptance follow-up migration', () => {
  const migrationSql = read(followupMigrationPath);
  const prismaSchema = read('prisma/schema.prisma');

  it('adds only the two proven missing columns', () => {
    const addColumnStatements = migrationSql.match(/\bADD COLUMN\b/gi) ?? [];

    expect(addColumnStatements).toHaveLength(2);
    expect(migrationSql).toContain('ALTER TABLE "public"."Order"');
    expect(migrationSql).toContain(
      'ADD COLUMN IF NOT EXISTS "appliedCouponCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]',
    );
    expect(migrationSql).toContain('ALTER TABLE "public"."PetalLedger"');
    expect(migrationSql).toContain(
      'ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
    );
  });

  it('matches the current Prisma schema fields', () => {
    expect(prismaSchema).toMatch(
      /model Order[\s\S]*appliedCouponCodes\s+String\[\]\s+@default\(\[\]\)/,
    );
    expect(prismaSchema).toMatch(/model PetalLedger[\s\S]*updatedAt\s+DateTime\s+@updatedAt/);
  });

  it('contains no destructive statements or credential material', () => {
    expect(migrationSql).not.toMatch(/\b(DROP|TRUNCATE|DELETE|RENAME|RESET)\b/i);
    expect(migrationSql).not.toMatch(/\b(OWNER|ROLE|GRANT|REVOKE)\b/i);
    expect(migrationSql).not.toMatch(/postgres(?:ql)?:\/\//i);
    expect(migrationSql).not.toMatch(/\b(password|secret|token|credential)\b/i);
  });

  it('does not alter the previously applied OTA-30 migrations', () => {
    for (const [path, expectedChecksum] of previousMigrationChecksums) {
      expect(sha256(path)).toBe(expectedChecksum);
    }
  });
});
