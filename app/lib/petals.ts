/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/app/lib/prisma";
import { LedgerType } from "@prisma/client";

export type PetalReason =
  | "PETAL_CLICK"
  | "CRIT_DROP"
  | "SHOP_PURCHASE"
  | "REFUND"
  | "ADMIN_ADJUST"
  | "ACHIEVEMENT"
  | "BONUS_EVENT";

/**
 * Atomically apply a petal delta and write a ledger row.
 * @param userId
 * @param type EARN | SPEND | ADJUST
 * @param amount positive integer
 * @param reason business reason code
 * @param metadata optional JSON (sku, orderId, etc.)
 */
export async function writePetalTxn(params: {
  userId: string;
  type: LedgerType;
  amount: number;              // positive
  reason: PetalReason;
  metadata?: Record<string, unknown>;
}) {
  const { userId, type, amount, reason, metadata } = params;
  if (amount <= 0 || !Number.isInteger(amount)) {
    throw new Error("Amount must be a positive integer");
  }

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { petalBalance: true } });
    if (!user) throw new Error("User not found");

    const delta = type === "spend" ? -amount : amount;
    const next = user.petalBalance + delta;

    if (next < 0) throw new Error("Insufficient petals");

    const updated = await tx.user.update({
      where: { id: userId },
      data: { petalBalance: next },
      select: { petalBalance: true },
    });

    await tx.petalLedger.create({
      data: {
        userId,
        type,
        amount,
        reason,
      },
    });

    return updated.petalBalance;
  });
}

/** Cursor-based pagination for ledger */
export async function getPetalLedger(params: {
  userId: string;
  limit?: number;
  cursor?: string | null; // id of last seen row
  type?: LedgerType | "ALL";
}) {
  const { userId, type = "ALL" } = params;
  const take = Math.min(Math.max(params.limit ?? 25, 1), 100);

  const where =
    type === "ALL"
      ? { userId }
      : { userId, type: type as LedgerType };

  const rows = await prisma.petalLedger.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(params.cursor ? { skip: 1, cursor: { id: params.cursor } } : {}),
  });

  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, -1) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

  return { items, nextCursor };
}
