'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require('next/server');
// Mock blog post data
let blogPosts = [
  { id: 1, title: 'Welcome to Otaku-mori', date: '2024-06-10', published: true },
  { id: 2, title: 'Sakura Storm Event', date: '2024-06-15', published: false },
];
async function GET() {
  // TODO: Connect to real database
  return server_1.NextResponse.json(blogPosts);
}
async function POST(req) {
  const data = await req.json();
  // TODO: Add post to real database
  const newPost = { ...data, id: Date.now() };
  blogPosts.push(newPost);
  return server_1.NextResponse.json(newPost, { status: 201 });
}
async function PUT(req) {
  const data = await req.json();
  // TODO: Update post in real database
  blogPosts = blogPosts.map(p => (p.id === data.id ? { ...p, ...data } : p));
  return server_1.NextResponse.json({ success: true });
}
async function DELETE(req) {
  const { id } = await req.json();
  // TODO: Remove post from real database
  blogPosts = blogPosts.filter(p => p.id !== id);
  return server_1.NextResponse.json({ success: true });
}
