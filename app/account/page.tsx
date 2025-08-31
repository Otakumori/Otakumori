import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { UsernameSuggestion } from '@/components/UsernameSuggestion';

export default async function AccountPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Account</h1>
          <UserButton afterSignOutUrl="/" />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Profile Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Profile</h2>
            <UsernameSuggestion
              onUsernameSelect={(username) => {
                console.log('Username selected:', username);
                // TODO: Implement username update logic
              }}
            />
          </div>

          {/* Settings Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Settings</h2>
            <p className="text-gray-600">
              Account settings and preferences will be available here.
            </p>
          </div>

          {/* Orders Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Orders</h2>
            <p className="text-gray-600">Your order history will appear here.</p>
          </div>

          {/* Petals Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Petal Balance</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌸</span>
              <span className="text-lg font-medium text-gray-900">Loading...</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Collect petals by completing orders and playing games.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
