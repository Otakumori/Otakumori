// DEPRECATED: This component is a duplicate. Use app\profile\ui\ProfileHeader.tsx instead.
'use client';
import useSWR from 'swr';

export default function ProfileHeader() {
  const { data } = useSWR('/api/profile/me', (u) => fetch(u).then((r) => r.json()));
  const user = data?.user;

  if (!user) return <div>{<><span role='img' aria-label='emoji'>L</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span>...</>}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center space-x-4">
        <img
          src={user.avatarUrl || '/assets/ui/profile/avatar_placeholder.png'}
          alt="Avatar"
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.display_name || user.username}</h1>
          <p className="text-gray-600">{user.email}</p>
          <div className="flex space-x-4 mt-2">
            <span className="text-sm text-gray-500">{<>''
              <span role='img' aria-label='emoji'>M</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>b</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>e</span>' '''</>}{new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
