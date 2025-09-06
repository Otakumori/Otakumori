// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Wishlist | Otaku-mori',
  description: 'Your wishlist of favorite items',
};

export default async function WishlistPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">My Wishlist</h1>

      <div className="bg-gray-900/50 rounded-lg p-8 text-center">
        <p className="text-gray-400 mb-4">Your wishlist is currently empty</p>
        <p className="text-sm text-gray-500">Add items from the shop to see them here</p>
      </div>
    </main>
  );
}
