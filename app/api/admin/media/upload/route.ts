import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth, currentUser } from "@clerk/nextjs/server";

export const runtime = "nodejs";

function assertEnv() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN");
  }
}

async function requireAdmin() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  if (!isAdmin) throw new Error("Forbidden");
}

export async function POST(req: Request) {
  try {
    assertEnv();
    await requireAdmin();

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });

    // Optional: light size guard (e.g., 10MB)
    const max = 10 * 1024 * 1024;
    if ((file as any).size && (file as any).size > max) {
      return NextResponse.json({ ok: false, error: "File too large" }, { status: 413 });
    }

    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const path = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { url } = await put(path, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ ok: true, url, path });
  } catch (err: any) {
    const message = err?.message || "Upload error";
    const code = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ ok: false, error: message }, { status: code });
  }
}
