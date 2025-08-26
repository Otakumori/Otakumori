/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const maxDuration = 10;
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const since = searchParams.get('since');

    const where: any = { userId };
    if (since) {
      where.createdAt = { gte: new Date(since) };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        stripeId: true,
        totalAmount: true,
        currency: true,
        status: true,
        memoryCardKey: true,
        createdAt: true,
        label: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
