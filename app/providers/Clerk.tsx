import { ClerkProvider } from '@clerk/nextjs';
import { env } from '@/env';

export default function Providers({ children }: { children: React.ReactNode }) {
  const key = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  return (
    <ClerkProvider publishableKey={key} dynamic>
      {children}
    </ClerkProvider>
  );
}
