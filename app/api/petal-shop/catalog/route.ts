import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { logger } from '@/app/lib/logger';
import { reqId } from '@/lib/log';
import { problem } from '@/lib/http/problem';
import { getPolicyFromRequest } from '@/app/lib/policy/fromRequest';
import { cosmeticItems, isNSFWCosmetic } from '@/app/lib/cosmetics/cosmeticsConfig';
import { isMissingSchemaError, schemaUnavailableResponse } from '@/app/lib/auth/viewer';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const rid = reqId(req.headers) ?? 'petal_shop_catalog';
  logger.request(req, 'GET /api/petal-shop/catalog');
  try {
    // Get NSFW policy
    const policy = getPolicyFromRequest(req);
    const nsfwAllowed = policy.nsfwAllowed;

    const now = new Date();
    const items = await prisma.petalShopItem.findMany({
      where: {
        OR: [
          { visibleFrom: null, visibleTo: null },
          { visibleFrom: null, visibleTo: { gte: now } },
          { visibleFrom: { lte: now }, visibleTo: null },
          { visibleFrom: { lte: now }, visibleTo: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter NSFW items if NSFW not allowed
    // Check metadata for NSFW flag or match against cosmeticsConfig
    const filteredItems = items.filter((item) => {
      // Check metadata for NSFW flag
      const metadata = item.metadata as any;
      if (metadata?.nsfw === true || metadata?.contentRating) {
        const contentRating = metadata.contentRating;
        if (contentRating && contentRating !== 'sfw' && !nsfwAllowed) {
          return false;
        }
      }

      // Check cosmeticsConfig for NSFW cosmetics
      const cosmeticItem = cosmeticItems.find((c) => c.id === item.sku);
      if (cosmeticItem && isNSFWCosmetic(cosmeticItem) && !nsfwAllowed) {
        return false;
      }

      return true;
    });

    return NextResponse.json({ ok: true, data: { items: filteredItems }, requestId: rid });
  } catch (e: any) {
    if (isMissingSchemaError(e)) {
      logger.warn('petal_shop_catalog_schema_unavailable', { requestId: rid });
      return NextResponse.json(schemaUnavailableResponse(rid), { status: 503 });
    }

    const errorName = e instanceof Error ? e.name : typeof e;
    const errorCode =
      e && typeof e === 'object' && 'code' in e ? String((e as { code?: unknown }).code) : undefined;
    logger.error(
      'petal_shop_catalog_error',
      { requestId: rid, extra: { errorName, errorCode } },
      undefined,
      new Error('Petal shop catalog failed'),
    );
    return NextResponse.json(problem(500, 'catalog_failed'), { status: 500 });
  }
}
