import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

const identity = vi.hoisted(() => ({ clerkUserId: '', localUserId: '' }));

vi.mock('@clerk/nextjs/server', () => ({
  auth: async () => ({ userId: identity.clerkUserId || null }),
}));

vi.mock('@/app/api/rate-limit', () => ({
  rateLimit: async () => ({ limited: false, remaining: 5, resetAt: Date.now() + 60_000 }),
}));

vi.mock('@/app/lib/auth/viewer', () => {
  class AuthenticationRequiredError extends Error {}
  class LocalUserUnavailableError extends Error {}

  return {
    AuthenticationRequiredError,
    LocalUserUnavailableError,
    isMissingSchemaError: () => false,
    requireLocalViewer: async () => ({
      clerkUserId: identity.clerkUserId,
      localUserId: identity.localUserId,
      email: `${identity.localUserId}@example.invalid`,
      username: identity.localUserId,
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

vi.mock('@/app/lib/rate-limiting', () => ({
  withRateLimit:
    (_key: string, handler: (request: NextRequest) => Promise<Response>) =>
    (request: NextRequest) =>
      handler(request),
}));

import { GET as getCatalog } from '@/app/api/petal-shop/catalog/route';
import { POST as purchaseItem } from '@/app/api/petal-shop/purchase/route';
import { GET as getGameSaves, POST as saveGame } from '@/app/api/v1/game-saves/route';
import {
  GET as getSessionAnalytics,
  POST as storeSessionAnalytics,
} from '@/app/api/v1/analytics/session/route';
import { ensureUserByClerkId } from '@/lib/petals-db';

const databaseUrl = process.env.DATABASE_URL;
const integrationEnabled = process.env.OTM_LOCAL_POSTGRES_INTEGRATION === '1';
const expectedDatabase = process.env.OTM_LOCAL_POSTGRES_DATABASE;
const expectedPort = Number(process.env.OTM_LOCAL_POSTGRES_PORT);
const prisma = databaseUrl ? new PrismaClient({ datasources: { db: { url: databaseUrl } } }) : null;
const suite =
  integrationEnabled && prisma && expectedDatabase && Number.isInteger(expectedPort)
    ? describe
    : describe.skip;
const runId = randomUUID().replaceAll('-', '');
const clerkId = `compat-clerk-${runId}`;
const sku = `compat-sku-${runId}`;

function request(path: string, init?: RequestInit) {
  return new NextRequest(`http://127.0.0.1${path}`, init);
}

suite.sequential('controlled-beta runtime schema compatibility', () => {
  beforeAll(async () => {
    const databaseIdentity = await prisma!.$queryRaw<
      Array<{ database: string; host: string | null; port: number | null }>
    >`SELECT current_database() AS database, host(inet_server_addr()) AS host, inet_server_port() AS port`;
    expect(databaseIdentity).toEqual([
      { database: expectedDatabase, host: '127.0.0.1', port: expectedPort },
    ]);
  });

  afterAll(async () => {
    await prisma!.idempotencyKey.deleteMany({
      where: {
        key: `legacy-petal-shop:${identity.localUserId}:compat-${runId}`,
      },
    });
    await prisma!.petalShopItem.deleteMany({ where: { sku } });
    await prisma!.user.deleteMany({ where: { clerkId } });
    await prisma!.$disconnect();
  });

  test('installs the catalog table with the required keys, constraints, and query indexes', async () => {
    const tables = await prisma!.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('GameSave', 'GameSession', 'PetalShopItem')
    `;
    expect(tables.map(({ table_name }) => table_name)).toEqual(
      expect.arrayContaining(['GameSave', 'GameSession', 'PetalShopItem']),
    );

    const constraints = await prisma!.$queryRaw<Array<{ constraint_name: string }>>`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'PetalShopItem'
    `;
    expect(constraints.map(({ constraint_name }) => constraint_name)).toEqual(
      expect.arrayContaining([
        'PetalShopItem_pkey',
        'PetalShopItem_sku_nonempty',
        'PetalShopItem_pricePetals_nonnegative',
        'PetalShopItem_visibility_window_valid',
      ]),
    );

    const indexes = await prisma!.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = 'PetalShopItem'
    `;
    expect(indexes.map(({ indexname }) => indexname)).toEqual(
      expect.arrayContaining([
        'PetalShopItem_sku_key',
        'PetalShopItem_eventTag_idx',
        'PetalShopItem_kind_idx',
        'PetalShopItem_visibleFrom_visibleTo_idx',
      ]),
    );

    const gameConstraints = await prisma!.$queryRaw<Array<{ constraint_name: string }>>`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name IN ('GameSave', 'GameSession')
    `;
    expect(gameConstraints.map(({ constraint_name }) => constraint_name)).toEqual(
      expect.arrayContaining([
        'GameSave_userId_fkey',
        'GameSave_slot_nonnegative',
        'GameSession_userId_fkey',
        'GameSession_time_window_valid',
      ]),
    );

    const inventoryColumns = await prisma!.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'InventoryItem'
        AND column_name IN ('createdAt', 'updatedAt')
    `;
    expect(inventoryColumns.map(({ column_name }) => column_name)).toEqual(
      expect.arrayContaining(['createdAt', 'updatedAt']),
    );

    const idempotencyColumns = await prisma!.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'IdempotencyKey'
        AND column_name = 'updatedAt'
    `;
    expect(idempotencyColumns).toEqual([{ column_name: 'updatedAt' }]);
  });

  test('serves a populated catalog through the production route', async () => {
    await prisma!.petalShopItem.create({
      data: {
        sku,
        name: 'Synthetic Beta Cosmetic',
        kind: 'COSMETIC',
        pricePetals: 25,
        metadata: { synthetic: true },
      },
    });

    const response = await getCatalog(request('/api/petal-shop/catalog'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      data: { items: [expect.objectContaining({ sku, pricePetals: 25 })] },
    });
  });

  test('purchases once through the production route and reconciles wallet, ledger, and inventory', async () => {
    identity.clerkUserId = clerkId;
    const user = await ensureUserByClerkId(clerkId);
    identity.localUserId = user.id;
    await prisma!.petalWallet.create({
      data: { userId: user.id, balance: 100, lifetimeEarned: 100 },
    });
    await prisma!.user.update({ where: { id: user.id }, data: { petalBalance: 100 } });

    const idempotencyKey = `compat-${runId}`;
    const buy = () =>
      purchaseItem(
        request('/api/petal-shop/purchase', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-idempotency-key': idempotencyKey,
          },
          body: JSON.stringify({ sku }),
        }),
      );

    const first = await buy();
    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({ ok: true, data: { balance: 75 } });

    const replay = await buy();
    expect(replay.status).toBe(200);
    expect(await replay.json()).toMatchObject({ ok: true, data: { alreadyOwned: true } });

    const [wallet, legacyUser, inventoryCount, transactionCount, ledgerCount] = await Promise.all([
      prisma!.petalWallet.findUniqueOrThrow({ where: { userId: user.id } }),
      prisma!.user.findUniqueOrThrow({ where: { id: user.id } }),
      prisma!.inventoryItem.count({ where: { userId: user.id, sku } }),
      prisma!.petalTransaction.count({ where: { userId: user.id, source: 'petal_shop_purchase' } }),
      prisma!.petalLedger.count({ where: { userId: user.id } }),
    ]);
    expect([
      wallet.balance,
      legacyUser.petalBalance,
      inventoryCount,
      transactionCount,
      ledgerCount,
    ]).toEqual([75, 75, 1, 1, 1]);
  });

  test('persists cloud saves through the production route and enforces one row per slot', async () => {
    const payload = { score: 4200, checkpoint: 3 };
    const save = () =>
      saveGame(
        request('/api/v1/game-saves', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ gameId: 'petal-samurai', slot: 0, payload }),
        }),
      );

    expect((await save()).status).toBe(200);
    expect((await save()).status).toBe(200);
    expect(
      await prisma!.gameSave.count({
        where: { userId: identity.localUserId, gameId: 'petal-samurai', slot: 0 },
      }),
    ).toBe(1);

    const response = await getGameSaves(request('/api/v1/game-saves?gameId=petal-samurai'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      data: { saves: [expect.objectContaining({ gameId: 'petal-samurai', slot: 0, payload })] },
    });
  });

  test('stores analytics under the authenticated local user and ignores forged client ownership', async () => {
    const sessionId = `compat-session-${runId}`;
    const response = await storeSessionAnalytics(
      request('/api/v1/analytics/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          gameId: 'petal-samurai',
          userId: 'forged-other-user',
          startTime: Date.now() - 1_000,
          endTime: Date.now(),
          score: 4200,
          highScore: 4200,
          actions: [],
          metadata: { synthetic: true },
          synced: false,
        }),
      }),
    );
    expect(response.status).toBe(200);
    expect(await prisma!.gameSession.findUniqueOrThrow({ where: { id: sessionId } })).toMatchObject(
      { userId: identity.localUserId, gameId: 'petal-samurai', score: 4200 },
    );

    const stats = await getSessionAnalytics(
      request('/api/v1/analytics/session?gameId=petal-samurai'),
    );
    expect(stats.status).toBe(200);
    expect(await stats.json()).toMatchObject({
      ok: true,
      data: { totalSessions: 1, highScore: 4200 },
    });
  });

  test('provisions application and database-default profiles as private without rewriting existing choices', async () => {
    const user = await prisma!.user.findUniqueOrThrow({ where: { clerkId } });
    expect(user.visibility).toBe('private');

    const defaultClerkId = `compat-default-clerk-${runId}`;
    await prisma!.$executeRaw`
      INSERT INTO "User" ("id", "email", "username", "clerkId", "updatedAt")
      VALUES (
        ${`compat-default-${runId}`},
        ${`compat-default-${runId}@example.invalid`},
        ${`compat_default_${runId}`},
        ${defaultClerkId},
        CURRENT_TIMESTAMP
      )
    `;
    const defaulted = await prisma!.user.findUniqueOrThrow({ where: { clerkId: defaultClerkId } });
    expect(defaulted.visibility).toBe('private');

    const preserved = await prisma!.user.findUniqueOrThrow({
      where: { clerkId: 'compat-pre-migration-public' },
    });
    expect(preserved.visibility).toBe('public');

    await prisma!.user.delete({ where: { clerkId: defaultClerkId } });
  });

  test('rejects invalid catalog economics at the database boundary', async () => {
    await expect(
      prisma!.petalShopItem.create({
        data: {
          sku: `negative-${runId}`,
          name: 'Invalid Item',
          kind: 'COSMETIC',
          pricePetals: -1,
        },
      }),
    ).rejects.toThrow(/PetalShopItem_pricePetals_nonnegative/);
  });
});
