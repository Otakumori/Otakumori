export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(
	_req: Request,
	{ params }: { params: { id: string } }
) {
	const { userId } = auth();
	if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

	// Simple: set isFlagged = true; You could also store a separate Flag table if needed
	await prisma.soapstoneMessage.update({
		where: { id: params.id },
		data: { isFlagged: true }
	});
	return NextResponse.json({ ok: true });
}
