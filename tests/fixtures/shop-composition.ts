import { shopProduct } from './shop-product';

// Presentation fixtures only: existing repository imagery, never provider inventory or orders.
export const compositionProducts = [
  {
    ...shopProduct,
    id: 'qa-archive-book',
    title: 'Archive edition',
    category: 'Books',
    categorySlug: 'books',
    image: '/assets/products/manga1.jpg',
    images: ['/assets/products/manga1.jpg'],
  },
  {
    ...shopProduct,
    id: 'qa-figure',
    title: 'Collection figure',
    category: 'Figures',
    categorySlug: 'figures',
    image: '/assets/products/figure1.jpg',
    images: ['/assets/products/figure1.jpg'],
  },
  {
    ...shopProduct,
    id: 'qa-art-print',
    title: 'Illustrated archive print',
    category: 'Art',
    categorySlug: 'art',
    image: '/assets/products/art1.jpg',
    images: ['/assets/products/art1.jpg'],
  },
];

export const compositionProduct = {
  ...compositionProducts[0],
  title:
    'Archive edition — illustrated collection with a deliberately long title for layout review',
  description:
    '<p>A presentation-only record for checking readable product information and purchase-control hierarchy.</p><p>This longer paragraph exercises wrapping without introducing delivery promises, stock claims, provider activity or a real product listing.</p>',
  variants: shopProduct.variants.map((variant, index) => ({
    ...variant,
    title: index ? 'Alternate edition with a longer option label' : 'Standard edition',
    previewImageUrl: index ? '/assets/products/art1.jpg' : '/assets/products/manga1.jpg',
  })),
};
