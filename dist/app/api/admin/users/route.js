'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require('next/server');
// Mock user data
let users = [
  { id: 1, name: 'Adi', email: 'adi@otakumori.com', role: 'admin', status: 'active' },
  { id: 2, name: 'User1', email: 'user1@email.com', role: 'user', status: 'active' },
  { id: 3, name: 'User2', email: 'user2@email.com', role: 'user', status: 'banned' },
];
async function GET() {
  // TODO: Connect to real database
  return server_1.NextResponse.json(users);
}
async function POST(req) {
  const data = await req.json();
  // TODO: Add user to real database
  const newUser = { ...data, id: Date.now() };
  users.push(newUser);
  return server_1.NextResponse.json(newUser, { status: 201 });
}
async function PUT(req) {
  const data = await req.json();
  // TODO: Update user in real database
  users = users.map(u => (u.id === data.id ? { ...u, ...data } : u));
  return server_1.NextResponse.json({ success: true });
}
async function DELETE(req) {
  const { id } = await req.json();
  // TODO: Remove user from real database
  users = users.filter(u => u.id !== id);
  return server_1.NextResponse.json({ success: true });
}
