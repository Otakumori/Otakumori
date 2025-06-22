import { NextRequest, NextResponse } from 'next/server';

// Mock user data
let users = [
  { id: 1, name: 'Adi', email: 'adi@otakumori.com', role: 'admin', status: 'active' },
  { id: 2, name: 'User1', email: 'user1@email.com', role: 'user', status: 'active' },
  { id: 3, name: 'User2', email: 'user2@email.com', role: 'user', status: 'banned' },
];

export async function GET() {
  // TODO: Connect to real database
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: Add user to real database
  const newUser = { ...data, id: Date.now() };
  users.push(newUser);
  return NextResponse.json(newUser, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  // TODO: Update user in real database
  users = users.map(u => (u.id === data.id ? { ...u, ...data } : u));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  // TODO: Remove user from real database
  users = users.filter(u => u.id !== id);
  return NextResponse.json({ success: true });
}
