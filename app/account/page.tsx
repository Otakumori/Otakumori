import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserProfile } from '@clerk/nextjs';

export default async function AccountPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Account Settings</h1>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <UserProfile />
      </div>
    </div>
  );
}
