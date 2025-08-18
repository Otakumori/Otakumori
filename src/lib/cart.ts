"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function addToCart(productId: string, qty = 1) {
  const { userId } = auth();
  if (!userId) throw new Error("UNAUTHENTICATED");
  
  // For now, just log the cart addition
  // You can implement actual cart storage later
  console.log(`Adding to cart: Product ${productId}, Quantity ${qty} for user ${userId}`);
  
  // TODO: Implement actual cart storage
  // await prisma.cartItem.upsert({
  //   where: { userId_productId: { userId, productId } },
  //   create: { userId, productId, qty },
  //   update: { qty: { increment: qty } },
  // });
  
  revalidatePath("/cart");
  return { ok: true } as const;
}

export async function getCart() {
  const { userId } = auth();
  if (!userId) return { items: [] };
  
  // TODO: Implement actual cart retrieval
  // const items = await prisma.cartItem.findMany({
  //   where: { userId },
  //   include: { product: true },
  // });
  
  return { items: [] };
}

export async function removeFromCart(productId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("UNAUTHENTICATED");
  
  // TODO: Implement actual cart removal
  console.log(`Removing from cart: Product ${productId} for user ${userId}`);
  
  revalidatePath("/cart");
  return { ok: true } as const;
}

export async function updateCartItem(productId: string, qty: number) {
  const { userId } = auth();
  if (!userId) throw new Error("UNAUTHENTICATED");
  
  if (qty <= 0) {
    return removeFromCart(productId);
  }
  
  // TODO: Implement actual cart update
  console.log(`Updating cart: Product ${productId}, Quantity ${qty} for user ${userId}`);
  
  revalidatePath("/cart");
  return { ok: true } as const;
}
