import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db as prisma } from "@/lib/db";

export const runtime = "nodejs";       // Node runtime for crypto
export const dynamic = "force-dynamic";

type ClerkEmail = { id: string; email_address: string };
type ClerkUser = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  primary_email_address_id: string | null;
  email_addresses: ClerkEmail[];
};

function getPrimaryEmail(u: ClerkUser): string | null {
  const pid = u.primary_email_address_id;
  if (!u.email_addresses?.length) return null;
  return (
    u.email_addresses.find((e) => e.id === pid)?.email_address ??
    u.email_addresses[0]?.email_address ??
    null
  );
}

export async function POST(req: Request) {
  const svixId = headers().get("svix-id");
  const svixTimestamp = headers().get("svix-timestamp");
  const svixSignature = headers().get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing Svix headers", { status: 400 });
  }

  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new NextResponse("Missing CLERK_WEBHOOK_SECRET", { status: 500 });

  const payload = await req.text();
  let evt: any;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // Idempotency: store the event id; if it exists, exit early.
  try {
    await prisma.webhookEvent.create({
      data: { id: evt.id, type: evt.type, payload: evt.data ?? {} },
    });
  } catch {
    // already processed
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const type: string = evt.type;

  // Core user sync
  if (type === "user.created" || type === "user.updated") {
    const u = evt.data as ClerkUser;
    const email = getPrimaryEmail(u);
    const userData = {
      clerkId: u.id,
      email,
      username: u.username ?? null,
      firstName: u.first_name ?? null,
      lastName: u.last_name ?? null,
      imageUrl: u.image_url ?? null,
    };

    await prisma.user.upsert({
      where: { clerkId: u.id },
      update: {
        email: userData.email || undefined,
        username: userData.username || undefined,
        display_name: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : undefined,
        avatarUrl: userData.imageUrl || undefined,
      },
      create: {
        clerkId: u.id,
        email: userData.email || '',
        username: userData.username || `user_${u.id.slice(0, 8)}`,
        display_name: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : undefined,
        avatarUrl: userData.imageUrl || undefined,
        wallet: { create: { petals: 0, runes: 0 } },
        profile: { create: {} },
      },
    });

    return NextResponse.json({ ok: true });
  }

  // Email updates (keep primary email in sync)
  if (type === "email.created" || type === "email.updated") {
    const u = evt.data as ClerkUser;
    const email = getPrimaryEmail(u);
    if (email) {
      await prisma.user.update({
        where: { clerkId: u.id },
        data: { email },
      }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  }

  if (type === "user.deleted") {
    const u = evt.data as { id: string };
    // For now, we'll just log the deletion since we don't have a deletedAt field
    console.log(`User deleted: ${u.id}`);
    return NextResponse.json({ ok: true });
  }

  // No-op for other events for now
  return NextResponse.json({ ok: true, ignored: type });
}