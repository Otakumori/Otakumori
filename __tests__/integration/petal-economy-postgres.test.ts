import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

const viewer = vi.hoisted(() => ({ localUserId: '' }));

vi.mock('@/app/lib/auth/viewer', () => {
  class AuthenticationRequiredError extends Error {}
  class LocalUserUnavailableError extends Error {}

  return {
    AuthenticationRequiredError,
    LocalUserUnavailableError,
    isMissingSchemaError: () => false,
    requireLocalViewer: async () => ({
      clerkUserId: `clerk_${viewer.localUserId}`,
      localUserId: viewer.localUserId,
      email: `${viewer.localUserId}@example.invalid`,
      username: viewer.localUserId,
      displayName: null,
      avatarUrl: null,
    }),
    schemaUnavailableResponse: (requestId: string) => ({
      ok: false,
      error: 'SCHEMA_UNAVAILABLE',
      requestId,
    }),
  };
});

import { POST as syncPetals } from '@/app/api/v1/petals/sync/route';
import {
  PetalSpendError,
  spendPetalsAndFulfill,
  spendPetalsInTransaction,
} from '@/app/lib/petals/spend';

const databaseUrl = process.env.DATABASE_URL;
const integrationEnabled = process.env.OTM_LOCAL_POSTGRES_INTEGRATION === '1';
const prisma = databaseUrl ? new PrismaClient({ datasources: { db: { url: databaseUrl } } }) : null;
const suite = integrationEnabled && prisma ? describe : describe.skip;
const runId = randomUUID().replaceAll('-', '');
let userSequence = 0;

async function createWallet(balance: number, lifetimeEarned = balance) {
  if (!prisma) throw new Error('Local PostgreSQL client is unavailable');
  userSequence += 1;
  const user = await prisma.user.create({
    data: {
      email: `security-${runId}-${userSequence}@example.invalid`,
      username: `security_${runId.slice(0, 10)}_${userSequence}`,
      clerkId: `security-clerk-${runId}-${userSequence}`,
      petalBalance: balance,
      visibility: 'private',
      PetalWallet: {
        create: { balance, lifetimeEarned, currentStreak: 4 },
      },
    },
    include: { PetalWallet: true },
  });
  return user;
}

async function walletFacts(userId: string) {
  if (!prisma) throw new Error('Local PostgreSQL client is unavailable');
  return Promise.all([
    prisma.petalWallet.findUniqueOrThrow({ where: { userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.petalTransaction.count({ where: { userId } }),
    prisma.petalLedger.count({ where: { userId } }),
  ]);
}

function syncRequest(payload: unknown) {
  return new NextRequest('http://127.0.0.1/api/v1/petals/sync', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

suite.sequential('petal economy PostgreSQL invariants', () => {
  beforeAll(async () => {
    const identity = await prisma!.$queryRaw<
      Array<{ database: string; host: string | null; port: number | null }>
    >`SELECT current_database() AS database, host(inet_server_addr()) AS host, inet_server_port() AS port`;
    expect(identity).toEqual([
      { database: 'otm_security_test_20261101', host: '127.0.0.1', port: 55439 },
    ]);
  });

  afterAll(async () => {
    await prisma!.idempotencyKey.deleteMany({ where: { key: { startsWith: `security:${runId}:` } } });
    await prisma!.user.deleteMany({ where: { clerkId: { startsWith: `security-clerk-${runId}-` } } });
    await prisma!.$disconnect();
  });

  test('allows only one of two simultaneous spends that compete for the same balance', async () => {
    const user = await createWallet(100);
    const results = await Promise.allSettled([
      spendPetalsAndFulfill(user.id, 60, 'contention A', 'security_test', async () => 'A'),
      spendPetalsAndFulfill(user.id, 60, 'contention B', 'security_test', async () => 'B'),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    const [wallet, legacy, transactions, ledger] = await walletFacts(user.id);
    expect([wallet.balance, legacy.petalBalance, transactions, ledger]).toEqual([40, 40, 1, 1]);
  });

  test('rejects multiple simultaneous spends when every request is unaffordable', async () => {
    const user = await createWallet(50);
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, (_, index) =>
        spendPetalsAndFulfill(user.id, 60, `insufficient ${index}`, 'security_test', async () => index),
      ),
    );
    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    const [wallet, legacy, transactions, ledger] = await walletFacts(user.id);
    expect([wallet.balance, legacy.petalBalance, transactions, ledger]).toEqual([50, 50, 0, 0]);
  });

  test('makes a duplicate idempotency-key purchase charge and fulfill exactly once', async () => {
    const user = await createWallet(100);
    const key = `security:${runId}:duplicate`;
    const purchase = () =>
      spendPetalsAndFulfill(user.id, 25, 'idempotent inventory', 'security_test', async (tx) => {
        await tx.idempotencyKey.create({ data: { key, purpose: 'security_test' } });
        return tx.inventoryItem.create({
          data: { userId: user.id, sku: `security-sku-${runId}`, kind: 'COSMETIC' },
        });
      });
    const results = await Promise.allSettled([purchase(), purchase()]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await prisma!.inventoryItem.count({ where: { userId: user.id } })).toBe(1);
    expect((await prisma!.petalWallet.findUniqueOrThrow({ where: { userId: user.id } })).balance).toBe(75);
  });

  test('concurrent first-time wallet initialization creates one zero-value wallet', async () => {
    const user = await createWallet(1);
    await prisma!.petalWallet.delete({ where: { userId: user.id } });
    viewer.localUserId = user.id;
    const responses = await Promise.all(
      Array.from({ length: 12 }, () => syncPetals(syncRequest({ localBalance: 0 }))),
    );
    expect(responses.every((response) => response.status === 200)).toBe(true);
    expect(await prisma!.petalWallet.count({ where: { userId: user.id } })).toBe(1);
    expect((await prisma!.petalWallet.findUniqueOrThrow({ where: { userId: user.id } })).balance).toBe(0);
  });

  test('reconciles wallet, transaction, ledger, legacy balance, and lifetime-earned facts', async () => {
    const user = await createWallet(90, 250);
    await spendPetalsAndFulfill(user.id, 30, 'reconciliation', 'security_test', async () => true);
    const [wallet, legacy, transactions, ledger] = await walletFacts(user.id);
    expect([wallet.balance, wallet.lifetimeEarned, legacy.petalBalance, transactions, ledger]).toEqual([
      60,
      250,
      60,
      1,
      1,
    ]);
  });

  test('rolls the debit back when the entitlement callback fails', async () => {
    const user = await createWallet(80);
    await expect(
      spendPetalsAndFulfill(user.id, 20, 'forced rollback', 'security_test', async () => {
        throw new Error('synthetic entitlement failure');
      }),
    ).rejects.toThrow('synthetic entitlement failure');
    const [wallet, legacy, transactions, ledger] = await walletFacts(user.id);
    expect([wallet.balance, legacy.petalBalance, transactions, ledger]).toEqual([80, 80, 0, 0]);
  });

  test('rolls the debit back when inventory creation fails', async () => {
    const user = await createWallet(80);
    await expect(
      spendPetalsAndFulfill(user.id, 20, 'invalid inventory', 'security_test', (tx) =>
        tx.inventoryItem.create({
          data: { userId: `missing-${runId}`, sku: 'invalid', kind: 'COSMETIC' },
        }),
      ),
    ).rejects.toBeTruthy();
    expect((await prisma!.petalWallet.findUniqueOrThrow({ where: { userId: user.id } })).balance).toBe(80);
  });

  test('rolls the debit back when voucher creation fails', async () => {
    const user = await createWallet(80);
    const code = `SEC-${runId.slice(0, 12)}`;
    await prisma!.couponGrant.create({
      data: { userId: user.id, code, discountType: 'PERCENT', percentOff: 5 },
    });
    await expect(
      spendPetalsAndFulfill(user.id, 20, 'duplicate voucher', 'security_test', (tx) =>
        tx.couponGrant.create({
          data: { userId: user.id, code, discountType: 'PERCENT', percentOff: 5 },
        }),
      ),
    ).rejects.toMatchObject({ code: 'P2002' });
    expect((await prisma!.petalWallet.findUniqueOrThrow({ where: { userId: user.id } })).balance).toBe(80);
  });

  test('serializes conflicting spends without producing a negative balance', async () => {
    const user = await createWallet(100);
    const results = await Promise.allSettled(
      Array.from({ length: 20 }, (_, index) =>
        spendPetalsAndFulfill(user.id, 10, `conflict ${index}`, 'security_test', async () => index),
      ),
    );
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(10);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(10);
    const [wallet, legacy, transactions, ledger] = await walletFacts(user.id);
    expect([wallet.balance, legacy.petalBalance, transactions, ledger]).toEqual([0, 0, 10, 10]);
  });

  test('keeps the server wallet authoritative over a forged browser balance', async () => {
    const user = await createWallet(35, 120);
    viewer.localUserId = user.id;
    const response = await syncPetals(syncRequest({ localBalance: 999_999, localTransactions: [] }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      data: { cloudBalance: 35, syncedBalance: 35, conflict: true, importedTransactions: 0 },
    });
    expect((await prisma!.petalWallet.findUniqueOrThrow({ where: { userId: user.id } })).balance).toBe(35);
  });

  test('does not import fabricated or duplicated browser transaction histories', async () => {
    const user = await createWallet(20);
    viewer.localUserId = user.id;
    const fake = { id: 'fabricated', amount: 500, source: 'browser', timestamp: Date.now() };
    const response = await syncPetals(
      syncRequest({ localBalance: 520, localTransactions: [fake, { ...fake, id: 'fabricated-copy' }] }),
    );
    expect((await response.json()).data).toMatchObject({
      cloudBalance: 20,
      importedTransactions: 0,
      requiresGuestProgressReview: true,
    });
    expect(await prisma!.petalTransaction.count({ where: { userId: user.id } })).toBe(0);
  });

  test('rejects invalid, negative, fractional, non-finite, and excessive spend units', async () => {
    const user = await createWallet(100);
    for (const amount of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
      await expect(
        prisma!.$transaction((tx) =>
          spendPetalsInTransaction(tx, user.id, amount, 'invalid input', 'security_test'),
        ),
      ).rejects.toBeInstanceOf(PetalSpendError);
    }
    expect((await prisma!.petalWallet.findUniqueOrThrow({ where: { userId: user.id } })).balance).toBe(100);
  });

  test('preserves authoritative facts after rejected transactions', async () => {
    const user = await createWallet(15, 90);
    await expect(
      spendPetalsAndFulfill(user.id, 16, 'rejected', 'security_test', async () => true),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_PETALS' });
    const [wallet, legacy, transactions, ledger] = await walletFacts(user.id);
    expect([wallet.balance, wallet.lifetimeEarned, wallet.currentStreak]).toEqual([15, 90, 4]);
    expect([legacy.petalBalance, transactions, ledger]).toEqual([15, 0, 0]);
  });

  test('isolates one user wallet and ledger from another user spend', async () => {
    const first = await createWallet(50);
    const second = await createWallet(70);
    await spendPetalsAndFulfill(first.id, 20, 'isolated', 'security_test', async () => true);
    expect((await prisma!.petalWallet.findUniqueOrThrow({ where: { userId: first.id } })).balance).toBe(30);
    expect((await prisma!.petalWallet.findUniqueOrThrow({ where: { userId: second.id } })).balance).toBe(70);
    expect(await prisma!.petalLedger.count({ where: { userId: second.id } })).toBe(0);
  });

  test('an uncertain-completion retry cannot charge or fulfill twice', async () => {
    const user = await createWallet(60);
    const key = `security:${runId}:uncertain`;
    const attempt = () =>
      spendPetalsAndFulfill(user.id, 20, 'uncertain completion', 'security_test', async (tx) => {
        await tx.idempotencyKey.create({ data: { key, purpose: 'security_test' } });
        return tx.inventoryItem.create({
          data: { userId: user.id, sku: `retry-${runId}`, kind: 'COSMETIC' },
        });
      });
    await attempt();
    await expect(attempt()).rejects.toMatchObject({ code: 'P2002' });
    const [wallet, legacy, transactions, ledger] = await walletFacts(user.id);
    expect([wallet.balance, legacy.petalBalance, transactions, ledger]).toEqual([40, 40, 1, 1]);
    expect(await prisma!.inventoryItem.count({ where: { userId: user.id } })).toBe(1);
  });
});
