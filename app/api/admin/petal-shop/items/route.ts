import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/authz";
import { logger, type LogCtx } from "@/app/lib/logger";
import { reqId } from "@/lib/log";
import { problem } from "@/lib/http/problem";

export const runtime = "nodejs";

const UpsertSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1),
  name: z.string().min(1),
  kind: z.string().min(1),
  pricePetals: z.number().int().min(0).nullable().optional(),
  eventTag: z.string().nullable().optional(),
  visibleFrom: z.string().nullable().optional(),
  visibleTo: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
});

export async function GET(req: NextRequest) {
  await requireAdmin();
  const rid = reqId(req.headers);
  logger.request(req, "GET /api/admin/petal-shop/items");
  const items = await prisma.petalShopItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, data: { items }, requestId: rid });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const rid = reqId(req.headers);
  logger.request(req, "POST /api/admin/petal-shop/items");
  const body = await req.json().catch(() => null);
  const parsed = UpsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(problem(400, "Bad input"));
  const v = parsed.data;

  try {
    const data = {
      sku: v.sku,
      name: v.name,
      kind: v.kind,
      pricePetals: v.pricePetals ?? null,
      eventTag: v.eventTag ?? null,
      visibleFrom: v.visibleFrom ? new Date(v.visibleFrom) : null,
      visibleTo: v.visibleTo ? new Date(v.visibleTo) : null,
      metadata: v.metadata ?? {},
    } satisfies Record<string, unknown>;

    const item = v.id
      ? await prisma.petalShopItem.update({ where: { id: v.id }, data })
      : await prisma.petalShopItem.create({ data });

    return NextResponse.json({ ok: true, data: { item }, requestId: rid });
  } catch (error) {
    const upsertCtx: LogCtx = rid ? { requestId: rid } : {};
    logger.error(
      "admin_petalshop_upsert_error",
      upsertCtx,
      { error: String(error instanceof Error ? error.message : error) },
    );
    return NextResponse.json(problem(500, "upsert_failed", error instanceof Error ? error.message : undefined), {
      status: 500,
    });
  }
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const rid = reqId(req.headers);
  logger.request(req, "DELETE /api/admin/petal-shop/items");
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json(problem(400, "Missing id"));

  try {
    await prisma.petalShopItem.delete({ where: { id } });
    return NextResponse.json({ ok: true, requestId: rid });
  } catch (error) {
    const deleteCtx: LogCtx = rid ? { requestId: rid } : {};
    logger.error(
      "admin_petalshop_delete_error",
      deleteCtx,
      { error: String(error instanceof Error ? error.message : error) },
    );
    return NextResponse.json(problem(500, "delete_failed", error instanceof Error ? error.message : undefined), {
      status: 500,
    });
  }
}
