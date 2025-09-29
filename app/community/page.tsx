import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { CommunityHub } from './_components/CommunityHub';

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black">
      <CommunityHub />
    </div>
  );
}
