// app/lib/auth.ts
import { auth } from '@clerk/nextjs/server';

export async function requireUserId() {
  const { userId } = await auth();
  if (!userId) {
    // For API routes, throw 401; for actions, throw or return a typed error
    const err = new Error('Unauthorized');
    (err as any).status = 401;
    throw err;
  }
  return userId;
}
