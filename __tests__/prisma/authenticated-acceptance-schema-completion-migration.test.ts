import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migrationPath =
  'prisma/migrations/20260728203000_authenticated_acceptance_schema_completion/migration.sql';

function read(path: string) {
  return readFileSync(path, 'utf8');
}

describe('authenticated acceptance schema completion migration', () => {
  const migrationSql = read(migrationPath);
  const prismaSchema = read('prisma/schema.prisma');

  it('adds exactly the confirmed missing Activity and Order columns', () => {
    const addColumnStatements = migrationSql.match(/\bADD COLUMN\b/gi) ?? [];

    expect(addColumnStatements).toHaveLength(7);
    expect(migrationSql).toContain('ALTER TABLE "public"."Activity"');
    expect(migrationSql).toContain(
      'ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
    );
    expect(migrationSql).toContain('ALTER TABLE "public"."Order"');
    expect(migrationSql).toContain('ADD COLUMN IF NOT EXISTS "taxAmount" INTEGER DEFAULT 0');
    expect(migrationSql).toContain('ADD COLUMN IF NOT EXISTS "shippingAmount" INTEGER DEFAULT 0');
    expect(migrationSql).toContain('ADD COLUMN IF NOT EXISTS "discountAmount" INTEGER DEFAULT 0');
    expect(migrationSql).toContain('ADD COLUMN IF NOT EXISTS "refundAmount" INTEGER DEFAULT 0');
    expect(migrationSql).toContain('ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP(3)');
    expect(migrationSql).toContain('ADD COLUMN IF NOT EXISTS "notes" TEXT');
  });

  it('matches the current Prisma schema nullability and defaults', () => {
    expect(prismaSchema).toMatch(/model Activity[\s\S]*updatedAt\s+DateTime\s+@updatedAt/);
    expect(prismaSchema).toMatch(/model Order[\s\S]*taxAmount\s+Int\?\s+@default\(0\)/);
    expect(prismaSchema).toMatch(/model Order[\s\S]*shippingAmount\s+Int\?\s+@default\(0\)/);
    expect(prismaSchema).toMatch(/model Order[\s\S]*discountAmount\s+Int\?\s+@default\(0\)/);
    expect(prismaSchema).toMatch(/model Order[\s\S]*refundAmount\s+Int\?\s+@default\(0\)/);
    expect(prismaSchema).toMatch(/model Order[\s\S]*refundedAt\s+DateTime\?/);
    expect(prismaSchema).toMatch(/model Order[\s\S]*notes\s+String\?/);
  });

  it('uses idempotent additive SQL only', () => {
    expect(migrationSql.match(/\bIF NOT EXISTS\b/gi) ?? []).toHaveLength(7);
    expect(migrationSql).not.toMatch(/\b(DROP|TRUNCATE|DELETE|RENAME|RESET)\b/i);
    expect(migrationSql).not.toMatch(/\b(OWNER|ROLE|GRANT|REVOKE)\b/i);
    expect(migrationSql).not.toMatch(/\b(UPDATE|INSERT)\b/i);
  });

  it('does not include connection strings or credential material', () => {
    expect(migrationSql).not.toMatch(/postgres(?:ql)?:\/\//i);
    expect(migrationSql).not.toMatch(/\b(password|secret|token|credential)\b/i);
  });
});
