 
 
import { NextResponse } from 'next/server';

const featuredProducts = [
  {
    id: '1',
    name: 'Cherry Blossom Hoodie',
    description:
      'Premium hoodie featuring beautiful cherry blossom design with Dark Souls-inspired elements. Perfect for those who appreciate both anime aesthetics and gaming culture.',
    price: 59.99,
    images: ['/assets/images/products/cherry-blossom-hoodie.jpg'],
    isNSFW: false,
  },
  {
    id: '2',
    name: 'Bloodborne Hunter Print',
    description:
      'Limited edition art print featuring the iconic Bloodborne hunter in a sakura garden setting. A perfect fusion of gothic horror and Japanese aesthetics.',
    price: 29.99,
    images: ['/assets/images/products/bloodborne-print.jpg'],
    isNSFW: false,
  },
  {
    id: '3',
    name: 'Kill la Kill Scissors Necklace',
    description:
      "Exclusive jewelry piece inspired by Ryuko's scissor blade from Kill la Kill. Made from high-quality materials with attention to detail.",
    price: 39.99,
    images: ['/assets/images/products/kill-la-kill-necklace.jpg'],
    isNSFW: false,
  },
  {
    id: '4',
    name: 'Dark Souls Bonfire Candle',
    description:
      'Atmospheric candle holder designed like the iconic bonfire from Dark Souls. Creates the perfect ambiance for gaming sessions.',
    price: 24.99,
    images: ['/assets/images/products/bonfire-candle.jpg'],
    isNSFW: false,
  },
  {
    id: '5',
    name: 'Anime Character Pin Set',
    description:
      'Collection of enamel pins featuring characters from popular anime series. Perfect for cosplay or everyday wear.',
    price: 19.99,
    images: ['/assets/images/products/anime-pins.jpg'],
    isNSFW: false,
  },
  {
    id: '6',
    name: 'Limited Edition Art Book',
    description:
      'Exclusive art book featuring the best community submissions and professional artwork. A must-have for any anime and gaming enthusiast.',
    price: 49.99,
    images: ['/assets/images/products/art-book.jpg'],
    isNSFW: false,
  },
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 });
  }
}
