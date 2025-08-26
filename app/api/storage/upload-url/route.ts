/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { prisma } from "@/app/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
		}

		const form = await req.formData();
		const file = form.get("file") as File | null;
		if (!file) {
			return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
		}

		// Validate file size (10MB limit)
		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			return NextResponse.json({ ok: false, error: "File too large" }, { status: 413 });
		}

		const key = `user_${userId}/${uuidv4()}_${file.name}`;
		const { url } = await put(key, file, {
			access: "public",
			contentType: file.type || "application/octet-stream",
			addRandomSuffix: false,
			token: process.env.BLOB_READ_WRITE_TOKEN,
		});

		// Save record
		await prisma.userFile.create({
			data: {
				userId: userId,
				key,
				url,
				size: file.size,
				mimeType: file.type || "application/octet-stream",
			},
		});

		return NextResponse.json({
			ok: true,
			file: { url, key, size: file.size, mimeType: file.type },
		});
	} catch (err) {
		console.error("upload error", err);
		return NextResponse.json({ ok: false, error: "UPLOAD_ERROR" }, { status: 500 });
	}
}
