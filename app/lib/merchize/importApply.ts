import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';

import { db } from '@/app/lib/db';
import {
  countsMatch,
  MERCHIZE_HIDDEN_IMPORT_MANIFEST_VERSION,
  loadMerchizeImportPlan,
  preflightCounts,
  verifyMerchizeImportPreflightSignature,
  type CanonicalMerchizeProduct,
  type MerchizeImportPreflight,
  type MerchizeImportPreflightCounts,
} from '@/app/lib/merchize/importPreflight';
import { env } from '@/env/server';

export const MERCHIZE_IMPORT_PROVIDER = 'merchize';
export const MERCHIZE_IMPORT_ACTION = 'hidden_local_import';
export const MERCHIZE_IMPORT_CONFIRMATION = 'APPLY HIDDEN MERCHIZE IMPORT';
const MIN_IDEMPOTENCY_KEY_LENGTH = 16;
const MAX_IDEMPOTENCY_KEY_LENGTH = 200;

type ImportStatus = 'completed' | 'blocked' | 'failed' | 'running' | 'pending';

type AuditRecord = Awaited<ReturnType<typeof createAuditRecord>>;
type ImportLogPayload = {
  requestId: string;
  route: string;
  userId: string;
  extra: Record<string, unknown>;
};

export type MerchizeImportApplyInput = {
  requestId: string;
  adminUserId: string;
  idempotencyKey: string;
  confirmation: string;
  manifestVersion: string;
  preflightFingerprint: string;
  fingerprintExpiresAt: string;
  preflightSignature: string;
  expectedCounts: MerchizeImportPreflightCounts;
  now?: Date;
  loadPlan?: typeof loadMerchizeImportPlan;
};

export type MerchizeImportApplyResult = {
  ok: boolean;
  provider: 'merchize';
  mode: 'hidden_local_import';
  replayed: boolean;
  status: ImportStatus;
  operationId?: string;
  requestId: string;
  productCount: number;
  inserted: number;
  updated: number;
  skipped: number;
  blocked: number;
  public: false;
  purchasable: false;
  products: Array<{
    provider: 'merchize';
    providerProductId: string;
    integrationRef: string;
    title: string;
    action: 'inserted' | 'updated' | 'skipped';
    public: false;
    purchasable: false;
    variantCount: number;
    imageCount: number;
  }>;
  error?: string;
};

class MerchizeImportApplyError extends Error {
  constructor(
    message: string,
    readonly category: string,
  ) {
    super(message);
    this.name = 'MerchizeImportApplyError';
  }
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return Boolean(error && typeof error === 'object' && (error as { code?: unknown }).code === code);
}

async function logImportInfo(message: string, payload: ImportLogPayload) {
  const { logger } = await import('@/app/lib/logger');
  logger.info(message, payload);
}

async function logImportError(message: string, payload: ImportLogPayload) {
  const { logger } = await import('@/app/lib/logger');
  logger.error(message, payload);
}

function assertValidIdempotencyKey(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    throw new MerchizeImportApplyError(
      'An idempotency key is required.',
      'idempotency_key_missing',
    );
  }

  if (
    normalized.length < MIN_IDEMPOTENCY_KEY_LENGTH ||
    normalized.length > MAX_IDEMPOTENCY_KEY_LENGTH ||
    normalized !== value ||
    !/^[A-Za-z0-9._~:/#@+=-]+$/.test(normalized)
  ) {
    throw new MerchizeImportApplyError(
      'The idempotency key format is invalid.',
      'idempotency_key_invalid',
    );
  }
}

function parseExpiry(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function hiddenImportEnabled(): boolean {
  return ['1', 'true', 'yes', 'on'].includes(
    (env.MERCHIZE_LOCAL_IMPORT_ENABLED ?? '').trim().toLowerCase(),
  );
}

export function assertMerchizeLocalImportEnabled() {
  if (!hiddenImportEnabled()) {
    throw new MerchizeImportApplyError(
      'Hidden local Merchize import is disabled.',
      'feature_disabled',
    );
  }
}

export function hashMerchizeImportIdempotencyKey(key: string): string {
  assertValidIdempotencyKey(key);
  return createHash('sha256')
    .update(`${MERCHIZE_IMPORT_PROVIDER}:${MERCHIZE_IMPORT_ACTION}:${key}`)
    .digest('hex');
}

export function sanitizeMerchizeImportError(error: unknown): {
  category: string;
  message: string;
} {
  if (error instanceof MerchizeImportApplyError) {
    return { category: error.category, message: error.message };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      category: `prisma_${error.code}`,
      message: 'Merchize import database operation failed.',
    };
  }

  if (hasPrismaCode(error, 'P2002')) {
    return {
      category: 'prisma_P2002',
      message: 'Merchize import database operation failed.',
    };
  }

  return {
    category: 'apply_failed',
    message: 'Merchize import apply failed. Check sanitized logs with the request ID.',
  };
}

function resultFromAudit(record: {
  id: string;
  requestId: string;
  status: string;
  expectedProductCount: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  blockedCount: number;
  failureMessage: string | null;
}): MerchizeImportApplyResult {
  const completed = record.status === 'completed';

  return {
    ok: completed,
    provider: 'merchize',
    mode: 'hidden_local_import',
    replayed: true,
    status: completed ? 'completed' : record.status === 'failed' ? 'failed' : 'blocked',
    operationId: record.id,
    requestId: record.requestId,
    productCount: record.expectedProductCount,
    inserted: record.insertedCount,
    updated: record.updatedCount,
    skipped: record.skippedCount,
    blocked: record.blockedCount,
    public: false,
    purchasable: false,
    products: [],
    error: completed
      ? undefined
      : (record.failureMessage ??
        'This idempotency key already belongs to a non-completed Merchize import attempt.'),
  };
}

async function replayExistingOperation(
  idempotencyKeyHash: string,
): Promise<MerchizeImportApplyResult | null> {
  const existing = await db.providerImportOperation.findUnique({
    where: {
      provider_action_idempotencyKeyHash: {
        provider: MERCHIZE_IMPORT_PROVIDER,
        action: MERCHIZE_IMPORT_ACTION,
        idempotencyKeyHash,
      },
    },
  });

  return existing ? resultFromAudit(existing) : null;
}

function validateExpectedPreflight(
  input: MerchizeImportApplyInput,
  preflight: MerchizeImportPreflight,
) {
  const expiresAt = parseExpiry(input.fingerprintExpiresAt);
  const now = input.now ?? new Date();

  if (input.confirmation !== MERCHIZE_IMPORT_CONFIRMATION) {
    throw new MerchizeImportApplyError(
      'Merchize import apply confirmation did not match.',
      'confirmation_mismatch',
    );
  }

  if (input.manifestVersion !== MERCHIZE_HIDDEN_IMPORT_MANIFEST_VERSION) {
    throw new MerchizeImportApplyError(
      'Merchize import manifest version did not match.',
      'manifest_version_mismatch',
    );
  }

  if (!expiresAt || expiresAt.getTime() <= now.getTime()) {
    throw new MerchizeImportApplyError(
      'Merchize import preflight fingerprint has expired.',
      'fingerprint_expired',
    );
  }

  if (
    !verifyMerchizeImportPreflightSignature({
      manifestVersion: input.manifestVersion,
      provider: MERCHIZE_IMPORT_PROVIDER,
      mode: MERCHIZE_IMPORT_ACTION,
      preflightFingerprint: input.preflightFingerprint,
      fingerprintExpiresAt: input.fingerprintExpiresAt,
      preflightSignature: input.preflightSignature,
    })
  ) {
    throw new MerchizeImportApplyError(
      'Merchize import preflight signature did not match.',
      'preflight_signature_mismatch',
    );
  }

  if (input.preflightFingerprint !== preflight.preflightFingerprint) {
    throw new MerchizeImportApplyError(
      'Merchize import preflight fingerprint did not match.',
      'fingerprint_mismatch',
    );
  }

  if (!countsMatch(preflight, input.expectedCounts)) {
    throw new MerchizeImportApplyError(
      'Merchize import preflight counts changed.',
      'expected_counts_mismatch',
    );
  }

  if (!preflight.safeToImport) {
    throw new MerchizeImportApplyError(
      'Merchize import preflight has blocked conditions.',
      'preflight_blocked',
    );
  }
}

async function createAuditRecord(
  input: MerchizeImportApplyInput,
  preflight: MerchizeImportPreflight,
) {
  return db.providerImportOperation.create({
    data: {
      requestId: input.requestId,
      adminUserId: input.adminUserId,
      provider: MERCHIZE_IMPORT_PROVIDER,
      action: MERCHIZE_IMPORT_ACTION,
      status: 'pending',
      preflightFingerprint: input.preflightFingerprint,
      fingerprintExpiresAt: new Date(input.fingerprintExpiresAt),
      idempotencyKeyHash: hashMerchizeImportIdempotencyKey(input.idempotencyKey),
      expectedProductCount: preflight.productCount,
      expectedInsertCount: preflight.wouldInsert,
      expectedUpdateCount: preflight.wouldUpdate,
      expectedSkipCount: preflight.wouldSkip,
      expectedBlockCount: preflight.wouldBlock,
    },
  });
}

async function markBlocked(
  auditRecord: AuditRecord,
  preflight: MerchizeImportPreflight,
  error: MerchizeImportApplyError,
  now: Date,
): Promise<MerchizeImportApplyResult> {
  await db.providerImportOperation.update({
    where: { id: auditRecord.id },
    data: {
      status: 'blocked',
      blockedCount: preflight.wouldBlock,
      failureCategory: error.category.slice(0, 100),
      failureMessage: error.message.slice(0, 500),
      completedAt: now,
    },
  });

  return {
    ok: false,
    provider: 'merchize',
    mode: 'hidden_local_import',
    replayed: false,
    status: 'blocked',
    operationId: auditRecord.id,
    requestId: auditRecord.requestId,
    productCount: preflight.productCount,
    inserted: 0,
    updated: 0,
    skipped: preflight.wouldSkip,
    blocked: preflight.wouldBlock,
    public: false,
    purchasable: false,
    products: [],
    error: error.message,
  };
}

function applyProductSummary(product: CanonicalMerchizeProduct) {
  const action: 'inserted' | 'updated' | 'skipped' =
    product.action === 'updated' || product.action === 'skipped' ? product.action : 'inserted';

  return {
    provider: 'merchize' as const,
    providerProductId: product.providerProductId,
    integrationRef: product.integrationRef,
    title: product.title,
    action,
    public: false as const,
    purchasable: false as const,
    variantCount: product.variantCount,
    imageCount: product.imageCount,
  };
}

async function applyHiddenProduct(tx: Prisma.TransactionClient, product: CanonicalMerchizeProduct) {
  const now = new Date();
  const productRecord = await tx.product.upsert({
    where: { integrationRef: product.integrationRef },
    update: {
      name: product.title,
      description: product.description,
      primaryImageUrl: product.primaryImageUrl,
      category: 'Merchize Import',
      categorySlug: 'merchize-import',
      active: false,
      visible: false,
      printifyProductId: null,
      tags: [],
      options: product.options,
      specs: product.specs,
      lastSyncedAt: now,
    },
    create: {
      name: product.title,
      description: product.description,
      primaryImageUrl: product.primaryImageUrl,
      category: 'Merchize Import',
      categorySlug: 'merchize-import',
      active: false,
      visible: false,
      tags: [],
      options: product.options,
      specs: product.specs,
      integrationRef: product.integrationRef,
      printifyProductId: null,
      lastSyncedAt: now,
    },
  });

  for (const image of product.images) {
    await tx.productImage.upsert({
      where: {
        productId_url: {
          productId: productRecord.id,
          url: image.url,
        },
      },
      update: {
        position: image.position,
        variantIds: [],
        isDefault: image.isDefault,
      },
      create: {
        productId: productRecord.id,
        url: image.url,
        position: image.position,
        variantIds: [],
        isDefault: image.isDefault,
      },
    });
  }

  if (product.incomingImageUrlSet.length > 0) {
    await tx.productImage.deleteMany({
      where: {
        productId: productRecord.id,
        url: { notIn: product.incomingImageUrlSet },
      },
    });
  }

  for (const variant of product.variants) {
    await tx.productVariant.upsert({
      where: {
        productId_providerVariantId: {
          productId: productRecord.id,
          providerVariantId: variant.providerVariantId,
        },
      },
      update: {
        previewImageUrl: variant.previewImageUrl,
        printifyVariantId: null,
        printProviderName: variant.printProviderName,
        title: variant.title,
        sku: variant.sku,
        grams: null,
        leadMinDays: null,
        leadMaxDays: null,
        isEnabled: false,
        inStock: variant.inStock,
        priceCents: variant.priceCents,
        currency: variant.currency,
        isDefaultVariant: variant.isDefaultVariant,
        optionValues: variant.optionValues,
        costCents: null,
        lastSyncedAt: now,
      },
      create: {
        productId: productRecord.id,
        previewImageUrl: variant.previewImageUrl,
        printifyVariantId: null,
        providerVariantId: variant.providerVariantId,
        printProviderName: variant.printProviderName,
        title: variant.title,
        sku: variant.sku,
        grams: null,
        leadMinDays: null,
        leadMaxDays: null,
        isEnabled: false,
        inStock: variant.inStock,
        priceCents: variant.priceCents,
        currency: variant.currency,
        isDefaultVariant: variant.isDefaultVariant,
        optionValues: variant.optionValues,
        costCents: null,
        lastSyncedAt: now,
      },
    });
  }

  if (product.incomingProviderVariantIdSet.length > 0) {
    await tx.productVariant.updateMany({
      where: {
        productId: productRecord.id,
        providerVariantId: { notIn: product.incomingProviderVariantIdSet },
        printProviderName: 'merchize',
        printifyVariantId: null,
      },
      data: { isEnabled: false, inStock: false },
    });
  }
}

export async function applyMerchizeHiddenLocalImport(
  input: MerchizeImportApplyInput,
): Promise<MerchizeImportApplyResult> {
  assertMerchizeLocalImportEnabled();
  const now = input.now ?? new Date();
  const idempotencyKeyHash = hashMerchizeImportIdempotencyKey(input.idempotencyKey);
  const existingReplay = await replayExistingOperation(idempotencyKeyHash);
  if (existingReplay) return existingReplay;

  const { preflight, manifest } = await (input.loadPlan ?? loadMerchizeImportPlan)();
  let auditRecord: AuditRecord;

  try {
    auditRecord = await createAuditRecord(input, preflight);
  } catch (error) {
    if (hasPrismaCode(error, 'P2002')) {
      const replay = await replayExistingOperation(idempotencyKeyHash);
      if (replay) return replay;
    }
    throw error;
  }

  try {
    validateExpectedPreflight(input, preflight);
  } catch (error) {
    if (error instanceof MerchizeImportApplyError) {
      return markBlocked(auditRecord, preflight, error, now);
    }
    throw error;
  }

  try {
    await db.providerImportOperation.update({
      where: { id: auditRecord.id },
      data: { status: 'running', startedAt: now },
    });

    await db.$transaction(async (tx) => {
      for (const product of manifest.products) {
        await applyHiddenProduct(tx, product);
      }

      await tx.providerImportOperation.update({
        where: { id: auditRecord.id },
        data: {
          status: 'completed',
          insertedCount: preflight.wouldInsert,
          updatedCount: preflight.wouldUpdate,
          skippedCount: preflight.wouldSkip,
          blockedCount: preflight.wouldBlock,
          completedAt: new Date(),
        },
      });
    });

    await logImportInfo('Merchize hidden local import completed', {
      requestId: input.requestId,
      route: '/api/admin/merchize/import/apply',
      userId: input.adminUserId,
      extra: {
        operationId: auditRecord.id,
        productCount: preflight.productCount,
        counts: preflightCounts(preflight),
      },
    });

    return {
      ok: true,
      provider: 'merchize',
      mode: 'hidden_local_import',
      replayed: false,
      status: 'completed',
      operationId: auditRecord.id,
      requestId: input.requestId,
      productCount: preflight.productCount,
      inserted: preflight.wouldInsert,
      updated: preflight.wouldUpdate,
      skipped: preflight.wouldSkip,
      blocked: preflight.wouldBlock,
      public: false,
      purchasable: false,
      products: manifest.products.map(applyProductSummary).slice(0, 25),
    };
  } catch (error) {
    const sanitized = sanitizeMerchizeImportError(error);
    await db.providerImportOperation.update({
      where: { id: auditRecord.id },
      data: {
        status: 'failed',
        failureCategory: sanitized.category.slice(0, 100),
        failureMessage: sanitized.message.slice(0, 500),
        completedAt: new Date(),
      },
    });

    await logImportError('Merchize hidden local import failed', {
      requestId: input.requestId,
      route: '/api/admin/merchize/import/apply',
      userId: input.adminUserId,
      extra: {
        operationId: auditRecord.id,
        failureCategory: sanitized.category,
      },
    });

    return {
      ok: false,
      provider: 'merchize',
      mode: 'hidden_local_import',
      replayed: false,
      status: 'failed',
      operationId: auditRecord.id,
      requestId: input.requestId,
      productCount: preflight.productCount,
      inserted: 0,
      updated: 0,
      skipped: 0,
      blocked: 0,
      public: false,
      purchasable: false,
      products: [],
      error: sanitized.message,
    };
  }
}
