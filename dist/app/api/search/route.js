'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GET = GET;
const server_1 = require('next/server');
const prisma_1 = require('@/app/lib/prisma');
async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  if (!query) {
    return server_1.NextResponse.json([]);
  }
  try {
    // Search products
    const products = await prisma_1.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
      },
      take: 5,
    });
    // Search blog posts
    const blogPosts = await prisma_1.prisma.blogPost.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
      },
      take: 5,
    });
    // Search achievements
    const achievements = await prisma_1.prisma.achievement.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
      },
      take: 5,
    });
    // Search users
    const users = await prisma_1.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        displayName: true,
      },
      take: 5,
    });
    // Combine and format results
    const results = [
      ...products.map(product => ({
        id: product.id,
        title: product.name,
        type: 'product',
        url: `/shop/${product.id}`,
      })),
      ...blogPosts.map(post => ({
        id: post.id,
        title: post.title,
        type: 'blog',
        url: `/blog/${post.id}`,
      })),
      ...achievements.map(achievement => ({
        id: achievement.id,
        title: achievement.name,
        type: 'achievement',
        url: `/achievements/${achievement.id}`,
      })),
      ...users.map(user => ({
        id: user.id,
        title: user.displayName,
        type: 'user',
        url: `/profile/${user.id}`,
      })),
    ];
    return server_1.NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return server_1.NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
