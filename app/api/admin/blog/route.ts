/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextRequest, NextResponse } from 'next/server';

// Mock blog post data
let blogPosts = [
  { id: 1, title: 'Welcome to Otaku-mori', date: '2024-06-10', published: true },
  { id: 2, title: 'Sakura Storm Event', date: '2024-06-15', published: false },
];

export async function GET() {
  // TODO: Connect to real database
  return NextResponse.json(blogPosts);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: Add post to real database
  const newPost = { ...data, id: Date.now() };
  blogPosts.push(newPost);
  return NextResponse.json(newPost, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  // TODO: Update post in real database
  blogPosts = blogPosts.map(p => (p.id === data.id ? { ...p, ...data } : p));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  // TODO: Remove post from real database
  blogPosts = blogPosts.filter(p => p.id !== id);
  return NextResponse.json({ success: true });
}
