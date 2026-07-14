-- Phase 4D-C: durable provider-neutral import operation audit trail.
CREATE TABLE "provider_import_operations" (
  "id" TEXT NOT NULL,
  "request_id" VARCHAR(100) NOT NULL,
  "admin_user_id" VARCHAR(255) NOT NULL,
  "provider" VARCHAR(64) NOT NULL,
  "action" VARCHAR(80) NOT NULL,
  "status" VARCHAR(64) NOT NULL DEFAULT 'pending',
  "preflight_fingerprint" VARCHAR(128) NOT NULL,
  "fingerprint_expires_at" TIMESTAMP(3) NOT NULL,
  "idempotency_key_hash" VARCHAR(128) NOT NULL,
  "expected_product_count" INTEGER NOT NULL DEFAULT 0,
  "expected_insert_count" INTEGER NOT NULL DEFAULT 0,
  "expected_update_count" INTEGER NOT NULL DEFAULT 0,
  "expected_skip_count" INTEGER NOT NULL DEFAULT 0,
  "expected_block_count" INTEGER NOT NULL DEFAULT 0,
  "inserted_count" INTEGER NOT NULL DEFAULT 0,
  "updated_count" INTEGER NOT NULL DEFAULT 0,
  "skipped_count" INTEGER NOT NULL DEFAULT 0,
  "blocked_count" INTEGER NOT NULL DEFAULT 0,
  "failure_category" VARCHAR(100),
  "failure_message" VARCHAR(500),
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "provider_import_operations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "provider_import_operations_request_id_key"
  ON "provider_import_operations"("request_id");

CREATE UNIQUE INDEX "provider_import_operations_provider_action_idempotency_key_hash_key"
  ON "provider_import_operations"("provider", "action", "idempotency_key_hash");

CREATE INDEX "provider_import_operations_provider_action_status_idx"
  ON "provider_import_operations"("provider", "action", "status");

CREATE INDEX "provider_import_operations_preflight_fingerprint_idx"
  ON "provider_import_operations"("preflight_fingerprint");

CREATE INDEX "provider_import_operations_started_at_idx"
  ON "provider_import_operations"("started_at");

CREATE INDEX "provider_import_operations_created_at_idx"
  ON "provider_import_operations"("created_at");
