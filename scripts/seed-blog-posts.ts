import { db } from '../app/lib/db';

const samplePosts = [
  {
    id: 'blog-1',
    slug: 'welcome-to-otaku-mori',
    title: 'Welcome to Otaku-mori: Your Digital Sanctuary',
    excerpt: 'Discover the magic of our anime-inspired platform and the community that makes it special.',
    body: 'Welcome to Otaku-mori, where anime culture meets digital innovation. Our platform is designed to be your digital sanctuary, a place where you can express your love for anime through interactive experiences, collectibles, and community engagement.',
    published: true,
    updatedAt: new Date(),
  },
  {
    id: 'blog-2',
    slug: 'petal-system-guide',
    title: 'Understanding the Petal System',
    excerpt: 'Learn how to earn and spend petals in our unique reward system.',
    body: 'The petal system is at the heart of Otaku-mori. Earn petals through various activities and spend them on exclusive items, experiences, and more. This guide will help you maximize your petal earnings.',
    published: true,
    updatedAt: new Date(),
  },
  {
    id: 'blog-3',
    slug: 'community-spotlight',
    title: 'Community Spotlight: Featured Creators',
    excerpt: 'Meet the talented creators who are shaping the Otaku-mori community.',
    body: 'Our community is full of amazing creators who bring their unique perspectives to anime culture. In this spotlight, we feature some of our most active and inspiring community members.',
    published: true,
    updatedAt: new Date(),
  },
  {
    id: 'blog-4',
    slug: 'upcoming-features',
    title: 'Upcoming Features: What to Expect',
    excerpt: 'A sneak peek at the exciting features coming to Otaku-mori.',
    body: 'We have many exciting features in development that will enhance your experience on Otaku-mori. From new mini-games to enhanced social features, there\'s always something new to look forward to.',
    published: true,
    updatedAt: new Date(),
  },
  {
    id: 'blog-5',
    slug: 'anime-recommendations',
    title: 'Staff Picks: Must-Watch Anime Series',
    excerpt: 'Our team\'s top anime recommendations for different genres and moods.',
    body: 'Looking for your next anime obsession? Our team has curated a list of must-watch series across different genres, from heartwarming slice-of-life to epic adventures.',
    published: true,
    updatedAt: new Date(),
  },
];

async function seedBlogPosts() {
  try {
    console.log('Seeding blog posts...');
    
    for (const post of samplePosts) {
      await db.contentPage.upsert({
        where: { id: post.id },
        update: post,
        create: post,
      });
      console.log(`Created/updated blog post: ${post.title}`);
    }
    
    console.log('Blog posts seeded successfully!');
  } catch (error) {
    console.error('Error seeding blog posts:', error);
  } finally {
    await db.$disconnect();
  }
}

seedBlogPosts();
