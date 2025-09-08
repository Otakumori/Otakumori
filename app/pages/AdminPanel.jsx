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
      <h2 className="text-xl font-bold text-white">{<><span role='img' aria-label='emoji'>A</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span>' '<span role='img' aria-label='emoji'>D</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>b</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>d</span></>}</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/products"
          className="rounded-lg bg-gray-800 p-6 text-white transition hover:bg-gray-700"
        >
          <h3 className="text-lg font-semibold">{<><span role='img' aria-label='emoji'>M</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>s</span></>}</h3>
          <p className="mt-2 text-gray-400">{<><span role='img' aria-label='emoji'>A</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>d</span>,' '<span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>t</span>,' '<span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>v</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>s</span></>}</p>
        </Link>

        <Link
          href="/admin/blog"
          className="rounded-lg bg-gray-800 p-6 text-white transition hover:bg-gray-700"
        >
          <h3 className="text-lg font-semibold">{<><span role='img' aria-label='emoji'>M</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>B</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>g</span>' '<span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>s</span></>}</h3>
          <p className="mt-2 text-gray-400">{<><span role='img' aria-label='emoji'>C</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>t</span>' '<span role='img' aria-label='emoji'>b</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>g</span>' '<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span></>}</p>
        </Link>

        <Link
          href="/admin/users"
          className="rounded-lg bg-gray-800 p-6 text-white transition hover:bg-gray-700"
        >
          <h3 className="text-lg font-semibold">{<><span role='img' aria-label='emoji'>U</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>M</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span></>}</h3>
          <p className="mt-2 text-gray-400">{<><span role='img' aria-label='emoji'>M</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>s</span>' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>s</span></>}</p>
        </Link>

        <Link
          href="/admin/analytics"
          className="rounded-lg bg-gray-800 p-6 text-white transition hover:bg-gray-700"
        >
          <h3 className="text-lg font-semibold">{<><span role='img' aria-label='emoji'>A</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>y</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>s</span>' '<span role='img' aria-label='emoji'>D</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>b</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>d</span></>}</h3>
          <p className="mt-2 text-gray-400">{<><span role='img' aria-label='emoji'>V</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>w</span>' '<span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>s</span>' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>s</span></>}</p>
        </Link>
      </div>
    </div>
  );
}
