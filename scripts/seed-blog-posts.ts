/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBlogPosts() {
  try {
    console.log('🌱 Seeding blog posts...');

    // Create sample blog posts
    const posts = [
      {
        title: 'Welcome to Otakumori: Your Anime Fashion Journey Begins',
        slug: 'welcome-to-otakumori',
        excerpt:
          "Discover the story behind Otakumori and how we're bringing anime culture to fashion.",
        content:
          "Welcome to Otakumori! We're excited to share our passion for anime-inspired fashion with you...",
        published: true,
        type: 'blog',
        metaTitle: 'Welcome to Otakumori - Anime Fashion Journey',
        metaDescription:
          "Discover the story behind Otakumori and how we're bringing anime culture to fashion.",
      },
      {
        title: 'Top 5 Anime Fashion Trends for 2024',
        slug: 'anime-fashion-trends-2024',
        excerpt:
          'Explore the hottest anime fashion trends that are taking the world by storm this year.',
        content:
          '2024 is bringing some incredible anime fashion trends that blend Japanese street style with pop culture...',
        published: true,
        type: 'blog',
        metaTitle: 'Top 5 Anime Fashion Trends 2024',
        metaDescription:
          'Explore the hottest anime fashion trends that are taking the world by storm this year.',
      },
      {
        title: 'How to Style Your Otakumori Collection',
        slug: 'style-otakumori-collection',
        excerpt: 'Learn expert tips on how to mix and match your favorite anime-inspired pieces.',
        content:
          'Your Otakumori collection is more versatile than you might think! Here are some styling tips...',
        published: true,
        type: 'blog',
        metaTitle: 'How to Style Your Otakumori Collection',
        metaDescription:
          'Learn expert tips on how to mix and match your favorite anime-inspired pieces.',
      },
      {
        title: 'The Art of Subtle Anime References in Fashion',
        slug: 'subtle-anime-references-fashion',
        excerpt:
          'Discover how to incorporate anime elements into your wardrobe without being too obvious.',
        content: 'Sometimes the best anime fashion is the kind that only fellow fans can spot...',
        published: true,
        type: 'blog',
        metaTitle: 'Subtle Anime References in Fashion',
        metaDescription:
          'Discover how to incorporate anime elements into your wardrobe without being too obvious.',
      },
      {
        title: 'Community Spotlight: Meet Our Top Designers',
        slug: 'community-spotlight-designers',
        excerpt:
          'Get to know the talented artists and designers behind your favorite Otakumori pieces.',
        content:
          'Our community is full of incredible artists who bring their unique vision to life...',
        published: true,
        type: 'blog',
        metaTitle: 'Community Spotlight: Meet Our Top Designers',
        metaDescription:
          'Get to know the talented artists and designers behind your favorite Otakumori pieces.',
      },
    ];

    for (const post of posts) {
      await prisma.contentPage.upsert({
        where: { slug: post.slug },
        update: post,
        create: {
          ...post,
          id: post.slug, // Use slug as ID
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Created/Updated: ${post.title}`);
    }

    console.log('🎉 Blog posts seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding blog posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBlogPosts();
