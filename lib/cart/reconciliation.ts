export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedVariant?: {
    id: string;
    title: string;
  };
}

export interface ServerCartItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
  product?: {
    title?: string;
    name?: string;
    image?: string | null;
  };
  variant?: {
    id?: string;
    title?: string | null;
    priceCents?: number | null;
  };
}

export type CartCheckoutIssue = {
  lineKey: string;
  code: 'missing_variant';
  message: string;
};

export type CartCheckoutReadiness = {
  ready: boolean;
  issues: CartCheckoutIssue[];
};

export const MAX_CART_ITEMS = 50;
export const MAX_LOCAL_CART_BYTES = 150_000;

export function getLineKey(item: CartItem) {
  return `${item.id}::${item.selectedVariant?.id ?? 'default'}`;
}

export function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

export function safeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isCartItem)
    .slice(0, MAX_CART_ITEMS)
    .map((item) => ({
      ...item,
      quantity: Math.min(Math.max(item.quantity, 1), 99),
      image: typeof item.image === 'string' && item.image.length < 1000 ? item.image : '/placeholder-product.jpg',
    }));
}

export function getCartSignature(cartItems: CartItem[]) {
  return JSON.stringify(cartItems.map((item) => ({ id: item.id, variantId: item.selectedVariant?.id ?? null, quantity: item.quantity })));
}

export function areCartItemsEqual(a: CartItem[], b: CartItem[]) {
  return getCartSignature(a) === getCartSignature(b);
}

export function reconcileCartItems(serverItems: CartItem[], localItems: CartItem[]) {
  const merged = new Map<string, CartItem>();

  for (const item of serverItems) merged.set(getLineKey(item), item);

  for (const item of localItems) {
    const lineKey = getLineKey(item);
    const existing = merged.get(lineKey);
    merged.set(
      lineKey,
      existing
        ? {
            ...existing,
            quantity: Math.max(existing.quantity, item.quantity),
            price: item.price || existing.price,
            image: item.image || existing.image,
            name: item.name || existing.name,
            selectedVariant: item.selectedVariant || existing.selectedVariant,
          }
        : item,
    );
  }

  return safeCartItems(Array.from(merged.values()));
}

export function normalizeServerCartItems(serverItems: ServerCartItem[]): CartItem[] {
  return safeCartItems(serverItems.map((item) => ({
    id: item.productId,
    name: item.product?.title || item.product?.name || 'Product',
    price: item.variant?.priceCents != null ? item.variant.priceCents / 100 : 0,
    quantity: item.quantity,
    image: item.product?.image || '/placeholder-product.jpg',
    selectedVariant: item.variantId ? { id: item.variantId, title: item.variant?.title || 'Variant' } : undefined,
  })));
}

export function getCartCheckoutReadiness(cartItems: CartItem[]): CartCheckoutReadiness {
  const issues = cartItems
    .filter((item) => !item.selectedVariant?.id)
    .map((item) => ({
      lineKey: getLineKey(item),
      code: 'missing_variant' as const,
      message: `${item.name} needs a selected variant before checkout.`,
    }));

  return {
    ready: cartItems.length > 0 && issues.length === 0,
    issues,
  };
}
