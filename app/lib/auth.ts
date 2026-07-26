// app/lib/auth.ts
import { requireClerkUserId } from '@/app/lib/auth/viewer';

export async function requireUserId() {
  return requireClerkUserId();
}
