/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Profile() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in?redirect_url=/profile');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold text-white">Your Shrine</h1>

        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-white">Profile Information</h2>
          <p className="text-gray-300">
            Welcome to your personal shrine. This page is protected and only visible to
            authenticated users.
          </p>

          <div className="mt-6 rounded-md bg-gray-700 p-4">
            <p className="text-gray-300">
              <strong>User ID:</strong> {userId}
            </p>
            <p className="mt-2 text-gray-300">
              <strong>Status:</strong> <span className="text-green-400">Authenticated</span>
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-white">Coming Soon</h2>
          <p className="text-gray-300">Your shrine will include:</p>
          <ul className="mt-3 list-inside list-disc space-y-2 text-gray-300">
            <li>Personal petal collection and statistics</li>
            <li>Rune collection and combo progress</li>
            <li>Order history and achievements</li>
            <li>Customizable avatar and profile</li>
            <li>Friends and community connections</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
