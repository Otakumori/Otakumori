import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const migrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260714121500_provider_import_audit_trail/migration.sql',
  ),
  'utf8',
);

describe('provider import audit migration', () => {
  it('creates only the provider import audit table', () => {
    expect(migrationSql).toContain('CREATE TABLE "provider_import_operations"');
    expect(migrationSql).not.toMatch(/\bALTER TABLE\b/i);
    expect(migrationSql).not.toMatch(/\bDROP TABLE\b/i);
    expect(migrationSql).not.toContain('"Product"');
    expect(migrationSql).not.toContain('"ProductVariant"');
    expect(migrationSql).not.toContain('"ProductImage"');
    expect(migrationSql).not.toContain('"Order"');
  });

  it('adds durable idempotency and lookup constraints', () => {
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX "provider_import_operations_request_id_key"',
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX "provider_import_operations_provider_action_idempotency_key_hash_key"',
    );
    expect(migrationSql).toContain(
      'CREATE INDEX "provider_import_operations_provider_action_status_idx"',
    );
    expect(migrationSql).toContain(
      'CREATE INDEX "provider_import_operations_preflight_fingerprint_idx"',
    );
  });

  it('does not store raw provider or customer payload fields', () => {
    expect(migrationSql).not.toMatch(/\bJSONB?\b/i);
    expect(migrationSql).not.toMatch(/payload|token|secret|stripe_payload|customer/i);
    expect(migrationSql).toContain('"failure_message" VARCHAR(500)');
  });
});
