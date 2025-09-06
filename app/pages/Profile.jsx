import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export default function Profile() {
  const [_user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('/assets/default-avatar.png');
  const [petals, setPetals] = useState(0);
  const { user: clerkUser, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && clerkUser) {
      setUser(clerkUser);
      // TODO: Replace with Prisma API call when migration is complete
      // For now, use placeholder data
      setAvatar('/assets/default-avatar.png');
      setPetals(0);
    }
  }, [clerkUser, isLoaded]);

  if (!isLoaded) {
    return (
      <Layout>
        <div className="rounded-xl bg-gray-800 p-8 text-center text-white">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!clerkUser) {
    return (
      <Layout>
        <div className="rounded-xl bg-gray-800 p-8 text-center text-white">
          <div>Please sign in to view your profile</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="rounded-xl bg-gray-800 p-8 text-center text-white">
        <Image src={avatar} alt="Profile Avatar" width={160} height={160} className="mx-auto rounded-full" />
        <h2 className="mt-4 text-4xl">
          Commander {clerkUser.emailAddresses[0]?.emailAddress || 'Loading...'}
        </h2>
        <p className="mt-2">Petals Collected: <span role="img" aria-label="cherry blossom">🌸</span> {petals}</p>
        <button className="mt-4 rounded-lg bg-pink-500 px-4 py-2 transition hover:bg-pink-600">
          Edit Profile
        </button>
      </div>
    </Layout>
  );
}
