import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

const identity = vi.hoisted(() => ({ clerkUserId: '' }));

vi.mock('@clerk/nextjs/server', () => ({
  auth: async () => ({ userId: identity.clerkUserId || null, sessionClaims: null }),
  currentUser: async () => null,
}));

vi.mock('@/env.mjs', () => ({
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: 'test',
  },
}));

vi.mock('@/env/client', () => ({
  clientEnv: { NEXT_PUBLIC_NSFW_FILTER_ENABLED: 'true' },
}));

vi.mock('@/app/lib/rate-limiting', () => ({
  withRateLimit:
    (_key: string, handler: (request: NextRequest) => Promise<Response>) =>
    (request: NextRequest) =>
      handler(request),
}));

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
const userId = `missing-schema-user-${runId}`;
const clerkId = `missing-schema-clerk-${runId}`;
const receiverId = `missing-schema-receiver-${runId}`;
const productId = `missing-schema-product-${runId}`;

function request(path: string, init?: RequestInit) {
  return new NextRequest(`http://127.0.0.1${path}`, init);
}

suite.sequential('controlled-beta missing-schema boundaries', () => {
  beforeAll(async () => {
    const identityRows = await prisma!.$queryRaw<
      Array<{ database: string; host: string | null; port: number | null }>
    >`SELECT current_database() AS database, host(inet_server_addr()) AS host, inet_server_port() AS port`;
    expect(identityRows).toEqual([
      { database: expectedDatabase, host: '127.0.0.1', port: expectedPort },
    ]);

    await prisma!.$executeRaw`
      INSERT INTO "User" ("id", "email", "username", "clerkId", "petalBalance", "nsfwEnabled", "updatedAt")
      VALUES (
        ${userId},
        ${`${userId}@example.invalid`},
        ${`missing_schema_${runId.slice(0, 12)}`},
        ${clerkId},
        5000,
        true,
        CURRENT_TIMESTAMP
      )
    `;
    await prisma!.$executeRaw`
      INSERT INTO "Product" ("id", "name", "updated_at")
      VALUES (${productId}, 'Synthetic Product', CURRENT_TIMESTAMP)
    `;
    await prisma!.$executeRaw`
      INSERT INTO "User" ("id", "email", "username", "clerkId", "updatedAt")
      VALUES (
        ${receiverId},
        ${`${receiverId}@example.invalid`},
        ${`missing_receiver_${runId.slice(0, 12)}`},
        ${`missing-receiver-clerk-${runId}`},
        CURRENT_TIMESTAMP
      )
    `;
    await prisma!.petalWallet.create({
      data: { userId, balance: 5000, lifetimeEarned: 5000 },
    });
    identity.clerkUserId = clerkId;
  });

  afterAll(async () => {
    await prisma!.product.deleteMany({ where: { id: productId } });
    await prisma!.user.deleteMany({ where: { id: { in: [userId, receiverId] } } });
    await prisma!.$disconnect();
  });

  test('falls back to static feature flags while mature content fails closed without SiteSetting', async () => {
    const { getSiteSettingsMap } = await import('@/app/lib/config/siteSettings.server');
    const { canAccessNSFWContent } = await import('@/app/lib/nsfw/user');
    const { shouldShowNSFWContent } = await import('@/app/lib/nsfw/visibility');

    await expect(getSiteSettingsMap()).resolves.toEqual({});
    await expect(canAccessNSFWContent(userId, 'nsfw')).resolves.toBe(false);
    await expect(
      shouldShowNSFWContent({ viewerUserId: userId, contentRating: 'nsfw' }),
    ).resolves.toBe(false);
  });

  test('keeps product soapstones read-only and rolls back the attempted debit when tables are absent', async () => {
    const { GET, POST } = await import('@/app/api/v1/products/[id]/soapstones/route');
    const context = { params: { id: productId } };

    const list = await GET(request(`/api/v1/products/${productId}/soapstones`), context);
    expect(list.status).toBe(200);
    expect(await list.json()).toMatchObject({ data: { soapstones: [], total: 0 } });

    const before = await prisma!.user.findUniqueOrThrow({ where: { id: userId } });
    const create = await POST(
      request(`/api/v1/products/${productId}/soapstones`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'Synthetic sign' }),
      }),
      context,
    );
    expect(create.status).toBe(503);
    const after = await prisma!.user.findUniqueOrThrow({ where: { id: userId } });
    expect(after.petalBalance).toBe(before.petalBalance);
  });

  test('reports unavailable praise schemas without granting rewards', async () => {
    const { POST: praiseProductSoapstone } = await import(
      '@/app/api/v1/products/soapstones/[id]/praise/route'
    );
    const { POST: praiseUser } = await import('@/app/api/v1/praise/route');
    const before = await prisma!.petalWallet.findUniqueOrThrow({ where: { userId } });
    const ledgerBefore = await prisma!.petalLedger.count({ where: { userId } });

    const productResponse = await praiseProductSoapstone(
      request('/api/v1/products/soapstones/missing/praise', { method: 'POST' }),
      { params: { id: 'missing' } },
    );
    expect(productResponse.status).toBe(503);

    const userResponse = await praiseUser(
      request('/api/v1/praise', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ receiverId }),
      }),
    );
    expect(userResponse.status).toBe(503);

    const after = await prisma!.petalWallet.findUniqueOrThrow({ where: { userId } });
    expect(after.balance).toBe(before.balance);
    expect(await prisma!.petalLedger.count({ where: { userId } })).toBe(ledgerBefore);
  });

  test('fails reward claims truthfully without changing the authoritative wallet', async () => {
    const { PETAL_REWARDS } = await import('@/app/lib/petal-economy');
    const { POST } = await import('@/app/api/v1/petals/rewards/claim/route');
    const reward = PETAL_REWARDS.find(({ type }) => type === 'discount');
    expect(reward).toBeDefined();

    const before = await prisma!.petalWallet.findUniqueOrThrow({ where: { userId } });
    const response = await POST(
      request('/api/v1/petals/rewards/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ threshold: reward!.threshold }),
      }),
    );
    expect(response.status).toBe(503);
    expect((await prisma!.petalWallet.findUniqueOrThrow({ where: { userId } })).balance).toBe(
      before.balance,
    );
  });
});
