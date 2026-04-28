export const commerceCoreConfig = {
  brandName: 'Otaku-mori',
  label: 'Commerce Core',
  headline: 'Stable store skeleton',
  description:
    'A clean ecommerce foundation for products, cart, account, checkout, orders, and audit-ready order data before immersive layers are added back in.',
  localCartKey: 'otakumori-commerce-core-cart',
  localCustomerKey: 'otakumori-commerce-core-customer',
  routes: {
    home: '/commerce-core',
    cart: '/commerce-core/cart',
    account: '/commerce-core/account',
    checkout: '/commerce-core/checkout',
    orders: '/commerce-core/orders',
    success: '/commerce-core/success',
  },
} as const;
