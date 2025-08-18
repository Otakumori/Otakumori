import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { auth, currentUser } from "@clerk/nextjs/server";

export const runtime = "nodejs";

async function requireAdmin() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  if (!isAdmin) throw new Error("Forbidden");
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { url } = await req.json();
    if (!url) return NextResponse.json({ ok: false, error: "Missing url" }, { status: 400 });
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err?.message || "Delete error";
    const code = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ ok: false, error: message }, { status: code });
  }
}
