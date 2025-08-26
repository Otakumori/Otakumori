/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { prisma } from '@/app/lib/prisma';

// Shop functions using Prisma
export const getProducts = async (params?: { 
  category?: string; 
  subcategory?: string; 
  page?: number; 
  pageSize?: number; 
}) => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where = {
    active: true,
    ...(params?.category && { category: params.category }),
  };

  const [products, count] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        ProductVariant: {
          where: { isEnabled: true },
          take: 1,
          orderBy: { priceCents: 'asc' }
        }
      },
      skip,
      take: pageSize,
      orderBy: { name: 'asc' }
    }),
    prisma.product.count({ where })
  ]);

  return { 
    data: products.map(p => ({
      id: p.id,
      title: p.name,
      description: p.description,
      images: p.primaryImageUrl ? [p.primaryImageUrl] : [],
      price: p.ProductVariant[0]?.priceCents ? p.ProductVariant[0].priceCents / 100 : 0,
      category: p.category,
      variants: p.ProductVariant
    })), 
    count, 
    pageSize 
  };
};

export const getProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      ProductVariant: {
        where: { isEnabled: true }
      }
    }
  });

  if (!product) return null;

  return {
    id: product.id,
    title: product.name,
    description: product.description,
    images: product.primaryImageUrl ? [product.primaryImageUrl] : [],
    price: product.ProductVariant[0]?.priceCents ? product.ProductVariant[0].priceCents / 100 : 0,
    category: product.category,
    variants: product.ProductVariant
  };
};