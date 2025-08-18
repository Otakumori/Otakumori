export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getRedis } from "@/app/lib/redis";

const schema = z.object({
	content: z.string().min(1).max(160)
});

function mildProfanityBlock(s: string) {
	const bad = [/fuck(?=\W|$)/i, /slur1/i, /slur2/i];
	return bad.some(rx => rx.test(s));
}

function randomRotation() { return (Math.random() * 10 - 5); }

const memRl = new Map<string, { n: number; t: number }>();
async function rateLimited(ip: string, max = 6, windowMs = 60_000) {
	const redis = getRedis();
	if (!redis) {
		const now = Date.now();
		const rec = memRl.get(ip) ?? { n: 0, t: now };
		if (now - rec.t > windowMs) { rec.n = 0; rec.t = now; }
		rec.n++; memRl.set(ip, rec);
		return rec.n > max;
	}
	const key = `rl:soapstones:${ip}`;
	const res = await redis.incr(key);
	if (res === 1) {
		await redis.expire(key, Math.ceil(windowMs / 1000));
	}
	return res > max;
}

export async function POST(req: Request) {
	const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "ip";
	if (await rateLimited(ip)) return NextResponse.json({ ok: false, reason: "rate" }, { status: 429 });
	const body = await req.json().catch(() => ({}));
	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
	const content = parsed.data.content.trim();
	if (mildProfanityBlock(content)) return NextResponse.json({ ok: false, reason: "blocked" }, { status: 400 });
	const { userId } = auth();
	const msg = await prisma.soapstoneMessage.create({ data: { userId: userId ?? null, content, rotation: randomRotation() } });
	return NextResponse.json({ ok: true, msg });
}

export async function GET(req: Request) {
	const url = new URL(req.url);
	const all = url.searchParams.get("all") === "1";
	const { userId } = auth();
	if (all) {
		const list = await prisma.soapstoneMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
		const meLikes: Record<string, true> = {};
		if (userId) {
			const liked = await prisma.soapstoneLike.findMany({ where: { userId, messageId: { in: list.map(l => l.id) } }, select: { messageId: true } });
			for (const l of liked) meLikes[l.messageId] = true;
		}
		return NextResponse.json({ ok: true, list, meLikes });
	}
	const list = await prisma.soapstoneMessage.findMany({ where: { isHidden: false }, orderBy: { createdAt: "desc" }, take: 60 });
	const meLikes: Record<string, true> = {};
	if (userId) {
		const liked = await prisma.soapstoneLike.findMany({ where: { userId, messageId: { in: list.map(l => l.id) } }, select: { messageId: true } });
		for (const l of liked) meLikes[l.messageId] = true;
	}
	return NextResponse.json({ ok: true, list, meLikes });
}
