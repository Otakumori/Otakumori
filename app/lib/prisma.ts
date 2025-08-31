/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (globalThis.process?.env?.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
