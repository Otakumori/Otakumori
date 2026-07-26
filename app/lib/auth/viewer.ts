import 'server-only';

import { createHash } from 'node:crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { User as ClerkUser, WebhookEvent } from '@clerk/nextjs/server';
import type { Prisma, PrismaClient } from '@prisma/client';

export class AuthenticationRequiredError extends Error {
  readonly status = 401;

  constructor() {
    super('Authentication required');
    this.name = 'AuthenticationRequiredError';
  }
}

export class LocalUserUnavailableError extends Error {
  readonly status = 503;

  constructor(message = 'Local account provisioning is temporarily unavailable') {
    super(message);
    this.name = 'LocalUserUnavailableError';
  }
}

export interface LocalViewer {
  clerkUserId: string;
  localUserId: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

const localViewerSelect = {
  id: true,
  clerkId: true,
  email: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

type LocalViewerRow = Prisma.UserGetPayload<{ select: typeof localViewerSelect }>;
type PrismaClientLike = Pick<
  PrismaClient,
  '$transaction' | 'user' | 'userProfile' | 'privacySettings' | 'userSettings' | 'cart' | 'wallet'
>;
type UserDelegateClientLike = Pick<PrismaClient, 'user'>;
type TransactionClientLike = Prisma.TransactionClient;

async function getPrismaClient(client?: PrismaClientLike): Promise<PrismaClientLike> {
  if (client) return client;
  const { prisma } = await import('@/app/lib/prisma');
  return prisma;
}

async function getUserDelegateClient(client?: UserDelegateClientLike): Promise<UserDelegateClientLike> {
  if (client) return client;
  const { prisma } = await import('@/app/lib/prisma');
  return prisma;
}

function stablePublicSuffix(seed: string) {
  return createHash('sha256').update(seed).digest('hex').slice(0, 12);
}

function fallbackUsername(clerkUserId: string) {
  return `traveler_${stablePublicSuffix(clerkUserId)}`;
}

function fallbackEmail(username: string) {
  return `${username}@users.otaku-mori.invalid`;
}

function normalizeEmail(value: unknown) {
  return typeof value === 'string' && value.includes('@') ? value.toLowerCase() : null;
}

function normalizeUsername(value: unknown, clerkUserId: string) {
  if (typeof value !== 'string') return fallbackUsername(clerkUserId);
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  return cleaned.length >= 3 ? cleaned : fallbackUsername(clerkUserId);
}

function displayNameFromParts(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(' ').trim() || null;
}

function clerkEmailFromUser(user: ClerkUser) {
  const primaryId = user.primaryEmailAddressId;
  const primary = user.emailAddresses.find((email) => email.id === primaryId);
  return normalizeEmail(primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress);
}

function clerkEmailFromWebhook(data: WebhookEvent['data']) {
  if (!('email_addresses' in data) || !Array.isArray(data.email_addresses)) return null;
  const primaryId = 'primary_email_address_id' in data ? data.primary_email_address_id : null;
  const primary = data.email_addresses.find((email) => email.id === primaryId);
  return normalizeEmail(primary?.email_address ?? data.email_addresses[0]?.email_address);
}

function toLocalViewer(row: LocalViewerRow): LocalViewer {
  return {
    clerkUserId: row.clerkId,
    localUserId: row.id,
    email: row.email,
    username: row.username,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
  };
}

async function chooseUniqueEmail(
  tx: TransactionClientLike,
  clerkUserId: string,
  requestedEmail: string | null,
  username: string,
) {
  if (!requestedEmail) return fallbackEmail(username);

  const existing = await tx.user.findUnique({
    where: { email: requestedEmail },
    select: { clerkId: true },
  });

  return existing && existing.clerkId !== clerkUserId ? fallbackEmail(username) : requestedEmail;
}

async function createRequiredDefaults(tx: TransactionClientLike, localUserId: string) {
  await Promise.all([
    tx.userProfile.upsert({
      where: { userId: localUserId },
      update: {},
      create: { userId: localUserId },
    }),
    tx.privacySettings.upsert({
      where: { userId: localUserId },
      update: {},
      create: { userId: localUserId },
    }),
    tx.userSettings.upsert({
      where: { userId: localUserId },
      update: {},
      create: { userId: localUserId },
    }),
    tx.cart.upsert({
      where: { userId: localUserId },
      update: {},
      create: { userId: localUserId },
    }),
    tx.wallet.upsert({
      where: { userId: localUserId },
      update: {},
      create: { userId: localUserId },
    }),
  ]);
}

export async function requireClerkUserId() {
  const { userId } = await auth();
  if (!userId) throw new AuthenticationRequiredError();
  return userId;
}

export async function findLocalUserByClerkId(
  clerkUserId: string,
  client?: UserDelegateClientLike,
) {
  const db = await getUserDelegateClient(client);
  const row = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: localViewerSelect,
  });

  return row ? toLocalViewer(row) : null;
}

export async function ensureLocalUser(
  clerkUser: ClerkUser,
  client?: PrismaClientLike,
): Promise<LocalViewer> {
  if (!clerkUser.id) throw new LocalUserUnavailableError('Clerk identity is missing an id');

  try {
    const db = await getPrismaClient(client);
    return await db.$transaction(async (tx) => {
      const username = normalizeUsername(clerkUser.username, clerkUser.id);
      const email = await chooseUniqueEmail(tx, clerkUser.id, clerkEmailFromUser(clerkUser), username);
      const displayName = displayNameFromParts(clerkUser.firstName, clerkUser.lastName);

      const user = await tx.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {
          email,
          username,
          displayName,
          avatarUrl: clerkUser.imageUrl ?? null,
        },
        create: {
          clerkId: clerkUser.id,
          email,
          username,
          displayName,
          avatarUrl: clerkUser.imageUrl ?? null,
        },
        select: localViewerSelect,
      });

      await createRequiredDefaults(tx, user.id);

      return toLocalViewer(user);
    });
  } catch (error) {
    throw new LocalUserUnavailableError(
      error instanceof Error ? error.message : 'Local account provisioning failed',
    );
  }
}

export async function requireLocalViewer(client?: PrismaClientLike): Promise<LocalViewer> {
  const clerkUserId = await requireClerkUserId();
  const existing = await findLocalUserByClerkId(clerkUserId, client);
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== clerkUserId) {
    throw new LocalUserUnavailableError('Clerk identity could not be loaded for provisioning');
  }

  return ensureLocalUser(clerkUser, client);
}

export async function upsertLocalUserFromClerkWebhook(
  data: WebhookEvent['data'],
  client?: PrismaClientLike,
) {
  if (!('id' in data) || typeof data.id !== 'string') {
    throw new LocalUserUnavailableError('Webhook payload is missing Clerk user id');
  }

  const clerkUserId = data.id;

  const db = await getPrismaClient(client);

  return db.$transaction(async (tx) => {
    const username = normalizeUsername('username' in data ? data.username : null, clerkUserId);
    const email = await chooseUniqueEmail(tx, clerkUserId, clerkEmailFromWebhook(data), username);
    const displayName = displayNameFromParts(
      'first_name' in data ? data.first_name : null,
      'last_name' in data ? data.last_name : null,
    );
    const imageUrl = 'image_url' in data && typeof data.image_url === 'string' ? data.image_url : null;

    const user = await tx.user.upsert({
      where: { clerkId: clerkUserId },
      update: {
        email,
        username,
        displayName,
        avatarUrl: imageUrl,
      },
      create: {
        clerkId: clerkUserId,
        email,
        username,
        displayName,
        avatarUrl: imageUrl,
      },
      select: localViewerSelect,
    });

    await createRequiredDefaults(tx, user.id);

    return toLocalViewer(user);
  });
}

export function isMissingSchemaError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: string; message?: string; meta?: { modelName?: string } };
  if (candidate.code === 'P2021' || candidate.code === 'P2022') return true;
  const message = candidate.message ?? '';
  return /does not exist|column .* does not exist|table .* does not exist/i.test(message);
}

export function schemaUnavailableResponse(requestId: string) {
  return {
    ok: false,
    error: {
      code: 'SCHEMA_UNAVAILABLE',
      message: 'This account feature is temporarily unavailable while account data is prepared.',
    },
    requestId,
  };
}
