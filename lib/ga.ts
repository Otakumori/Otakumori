import { clientEnv } from '@/env/client';

export const GA_ID = clientEnv.NEXT_PUBLIC_GA_ID || '';

export const pageview = (path: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_ID, {
      page_path: path,
    });
  }
};

export type GAEventParams = Record<string, any>;

export const gaEvent = (name: string, params?: GAEventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params);
  }
};

// E-commerce tracking functions
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) => {
  gaEvent('add_to_cart', {
    currency: 'USD',
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
      },
    ],
  });
};

export const trackBeginCheckout = (cart: {
  totalPrice: number;
  totalItems: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  gaEvent('begin_checkout', {
    currency: 'USD',
    value: cart.totalPrice,
    items: cart.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

export const trackPurchase = (order: {
  id: string;
  total: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  gaEvent('purchase', {
    transaction_id: order.id,
    value: order.total,
    currency: order.currency || 'USD',
    items: order.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

export const trackViewItem = (product: { id: string; name: string; price: number }) => {
  gaEvent('view_item', {
    currency: 'USD',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
      },
    ],
  });
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
