'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

export async function addToCart(productId: string, qty = 1) {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHENTICATED');

  // Log the cart addition for analytics
  console.warn('Adding to cart', { userId, productId, qty });

  // TODO: Implement actual cart storage when Prisma migration is complete
  // await prisma.cartItem.upsert({
  //   where: { userId_productId: { userId, productId } },
  //   create: { userId, productId, qty },
  //   update: { qty: { increment: qty } },
  // });

  revalidatePath('/cart');
  return { ok: true } as const;
}

export async function getCart() {
  const { userId } = await auth();
  if (!userId) return { items: [] };

  // TODO: Implement actual cart retrieval
  // const items = await prisma.cartItem.findMany({
  //   where: { userId },
  //   include: { product: true },
  // });

  return { items: [] };
}

export async function removeFromCart(productId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHENTICATED');

  // Log removal for analytics
  console.warn('Removing from cart', { userId, productId });

  // TODO: Implement actual cart removal when Prisma migration is complete
  // await prisma.cartItem.delete({
  //   where: { userId_productId: { userId, productId } }
  // });

  revalidatePath('/cart');
  return { ok: true } as const;
}

export async function updateCartItem(productId: string, qty: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHENTICATED');

  if (qty <= 0) {
    return removeFromCart(productId);
  }

  // TODO: Implement actual cart update
  // Updating cart

  revalidatePath('/cart');
  return { ok: true } as const;
}
