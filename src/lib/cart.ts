'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

export async function addToCart(productId: string, qty = 1) {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHENTICATED');

  // For now, just log the cart addition
  // You can implement actual cart storage later
  // Adding to cart

  // TODO: Implement actual cart storage
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

  // TODO: Implement actual cart removal
  // Removing from cart

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
