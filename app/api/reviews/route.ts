import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

type CreateReviewBody = {
  productId: string;
  rating: number;
  title?: string;
  body: string;
  imageUrls?: string[];
};

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const json = (await req.json()) as CreateReviewBody;
  if (!json.productId || !json.body || !json.rating) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }
  if (json.rating < 1 || json.rating > 5) {
    return NextResponse.json({ ok: false, error: "Invalid rating" }, { status: 400 });
  }

  // Rate limits
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [recentForProduct, recentGlobal] = await Promise.all([
    prisma.productReview.count({
      where: { userId, productId: json.productId, createdAt: { gte: since } },
    }),
    prisma.productReview.count({
      where: { userId, createdAt: { gte: since } },
    }),
  ]);

  if (recentForProduct > 0) {
    return NextResponse.json(
      { ok: false, error: "You can only review this product once per 24 hours." },
      { status: 429 }
    );
  }
  if (recentGlobal >= 5) {
    return NextResponse.json(
      { ok: false, error: "Daily review limit reached. Try again tomorrow." },
      { status: 429 }
    );
  }

  // Optional: ensure product exists
  const product = await prisma.product.findUnique({ where: { id: json.productId } });
  if (!product) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });

  const imgs = (json.imageUrls ?? []).slice(0, 3);

  const review = await prisma.productReview.create({
    data: {
      productId: json.productId,
      userId,
      rating: json.rating,
      title: json.title ?? null,
      body: json.body,
      imageUrls: imgs,
      isApproved: false, // moderation gate
    },
  });

  return NextResponse.json({ ok: true, review });
}
