/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from './AdminDashboardClient';

export default async function AdminPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in?redirect_url=/admin');

  return <AdminDashboardClient />;
}
