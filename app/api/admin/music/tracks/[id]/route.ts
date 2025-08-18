import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/authz";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ ok: false }, { status: admin.status });

  await prisma.musicTrack.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
