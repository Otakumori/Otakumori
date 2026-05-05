import { generateSEO } from '@/app/lib/seo';
import ProfilePageClient from './ProfilePageClient';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  return generateSEO({
    title: 'User Profile',
    description: 'View user profile',
    url: `/profile/${username}`,
  });
}

export default function ProfilePage() {
  return <ProfilePageClient />;
}
