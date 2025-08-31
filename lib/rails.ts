import { db } from '@/app/lib/db';

export interface HomeRail {
  id: string;
  key: string;
  title: string;
  productSlugs: string[];
  startsAt: Date | null;
  endsAt: Date | null;
}

export interface RailWithProducts extends HomeRail {
  products: Array<{
    id: string;
    name: string;
    primaryImageUrl: string | null;
    categorySlug: string | null;
  }>;
}

export async function getActiveRails(): Promise<HomeRail[]> {
  const now = new Date();

  const rails = await db.homeRail.findMany({
    where: {
      OR: [
        {
          startsAt: null,
          endsAt: null,
        },
        {
          startsAt: { lte: now },
          endsAt: null,
        },
        {
          startsAt: null,
          endsAt: { gte: now },
        },
        {
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return rails;
}

export async function getRailsWithProducts(): Promise<RailWithProducts[]> {
  const rails = await getActiveRails();

  const railsWithProducts = await Promise.all(
    rails.map(async (rail) => {
      const products = await db.product.findMany({
        where: {
          id: { in: rail.productSlugs },
          active: true,
        },
        select: {
          id: true,
          name: true,
          primaryImageUrl: true,
          categorySlug: true,
        },
        take: 8, // Limit products per rail
      });

      return {
        ...rail,
        products,
      };
    }),
  );

  return railsWithProducts;
}

export async function createRail(data: {
  key: string;
  title: string;
  productSlugs: string[];
  startsAt?: Date;
  endsAt?: Date;
}) {
  return await db.homeRail.create({
    data: {
      key: data.key,
      title: data.title,
      productSlugs: data.productSlugs,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    },
  });
}

export async function updateRail(
  id: string,
  data: {
    title?: string;
    productSlugs?: string[];
    startsAt?: Date;
    endsAt?: Date;
  },
) {
  return await db.homeRail.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}
