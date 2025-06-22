import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = {};

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
