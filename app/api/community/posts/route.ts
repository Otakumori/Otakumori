/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { NextResponse } from 'next/server';

const mockPosts = [
  {
    id: '1',
    image: '/assets/images/community/cosplay-1.jpg',
    caption:
      'My first attempt at a Dark Souls cosplay! The armor took forever but totally worth it 🗡️',
    author: {
      name: 'SolaireFan',
      avatar: '/assets/images/avatars/solaire-fan.jpg',
    },
    likes: 156,
    comments: 23,
    createdAt: '2024-03-15T10:00:00Z',
    type: 'cosplay',
  },
  {
    id: '2',
    image: '/assets/images/community/purchase-1.jpg',
    caption:
      'Just got my new Otaku-mori hoodie! The quality is amazing and the design is perfect 🌸',
    author: {
      name: 'AnimeLover',
      avatar: '/assets/images/avatars/anime-lover.jpg',
    },
    likes: 89,
    comments: 12,
    createdAt: '2024-03-14T16:30:00Z',
    type: 'purchase',
  },
  {
    id: '3',
    image: '/assets/images/community/cosplay-2.jpg',
    caption:
      'Kill la Kill cosplay for the community meetup! The scissors were a pain to make but they turned out great ✂️',
    author: {
      name: 'RyukoCosplayer',
      avatar: '/assets/images/avatars/ryuko.jpg',
    },
    likes: 234,
    comments: 45,
    createdAt: '2024-03-13T14:20:00Z',
    type: 'cosplay',
  },
  {
    id: '4',
    image: '/assets/images/community/purchase-2.jpg',
    caption: 'My collection is growing! The new limited edition prints are absolutely stunning 🎨',
    author: {
      name: 'ArtCollector',
      avatar: '/assets/images/avatars/art-collector.jpg',
    },
    likes: 67,
    comments: 8,
    createdAt: '2024-03-12T11:45:00Z',
    type: 'purchase',
  },
  {
    id: '5',
    image: '/assets/images/community/cosplay-3.jpg',
    caption:
      'Bloodborne hunter cosplay! The trick weapon was challenging but so satisfying to complete 🩸',
    author: {
      name: 'HunterCosplayer',
      avatar: '/assets/images/avatars/hunter.jpg',
    },
    likes: 189,
    comments: 31,
    createdAt: '2024-03-11T09:15:00Z',
    type: 'cosplay',
  },
  {
    id: '6',
    image: '/assets/images/community/purchase-3.jpg',
    caption:
      'Finally got my hands on the exclusive Otaku-mori merch! The attention to detail is incredible ✨',
    author: {
      name: 'MerchHunter',
      avatar: '/assets/images/avatars/merch-hunter.jpg',
    },
    likes: 123,
    comments: 19,
    createdAt: '2024-03-10T13:00:00Z',
    type: 'purchase',
  },
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(mockPosts);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json({ error: 'Failed to fetch community posts' }, { status: 500 });
  }
}
