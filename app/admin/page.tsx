 
 
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from './AdminDashboardClient';

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/admin');

  return <AdminDashboardClient />;
}
