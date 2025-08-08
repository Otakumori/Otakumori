import { NextResponse } from 'next/server';

const mockPosts = [
  {
    id: '1',
    title: 'The Art of Cherry Blossom Photography',
    excerpt: 'Discover the secrets to capturing the perfect sakura moment, from timing to composition techniques that will make your photos bloom with beauty.',
    coverImage: '/assets/images/blog/cherry-blossom-photography.jpg',
    author: {
      name: 'Sakura Sensei',
      avatar: '/assets/images/avatars/sakura-sensei.jpg'
    },
    createdAt: '2024-03-15T10:00:00Z',
    commentCount: 23
  },
  {
    id: '2',
    title: 'Dark Souls Meets Anime: A Perfect Fusion',
    excerpt: 'Exploring how the challenging gameplay of Dark Souls perfectly complements the emotional storytelling of anime, creating unforgettable gaming experiences.',
    coverImage: '/assets/images/blog/dark-souls-anime.jpg',
    author: {
      name: 'Solaire Cosplayer',
      avatar: '/assets/images/avatars/solaire.jpg'
    },
    createdAt: '2024-03-12T14:30:00Z',
    commentCount: 45
  },
  {
    id: '3',
    title: 'Building Community Through Shared Passion',
    excerpt: 'How our Otaku-mori community has grown from a small group of anime fans to a thriving ecosystem of creators, gamers, and artists.',
    coverImage: '/assets/images/blog/community-building.jpg',
    author: {
      name: 'Community Manager',
      avatar: '/assets/images/avatars/community-manager.jpg'
    },
    createdAt: '2024-03-10T09:15:00Z',
    commentCount: 67
  }
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(mockPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
} 