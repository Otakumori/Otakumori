/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AdminPanel() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check-admin');
        if (!response.ok) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/login');
      }
    };
    checkAdmin();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/products"
          className="rounded-lg bg-gray-800 p-6 text-white transition hover:bg-gray-700"
        >
          <h3 className="text-lg font-semibold">Manage Products</h3>
          <p className="mt-2 text-gray-400">Add, edit, or remove products</p>
        </Link>

        <Link
          href="/admin/blog"
          className="rounded-lg bg-gray-800 p-6 text-white transition hover:bg-gray-700"
        >
          <h3 className="text-lg font-semibold">Manage Blog Posts</h3>
          <p className="mt-2 text-gray-400">Create and edit blog content</p>
        </Link>

        <Link
          href="/admin/users"
          className="rounded-lg bg-gray-800 p-6 text-white transition hover:bg-gray-700"
        >
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="mt-2 text-gray-400">Manage user accounts and permissions</p>
        </Link>

        <Link
          href="/admin/analytics"
          className="rounded-lg bg-gray-800 p-6 text-white transition hover:bg-gray-700"
        >
          <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
          <p className="mt-2 text-gray-400">View site statistics and reports</p>
        </Link>
      </div>
    </div>
  );
}
