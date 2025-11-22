'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  petalBalance: number;
  lifetimePetalsEarned: number;
  nsfwEnabled: boolean;
  createdAt: Date;
}

export default function UsersPageClient() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data?.ok && data?.data?.users) {
            setUsers(data.data.users);
          }
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-neutral-400">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-3xl font-bold text-white flex items-center gap-2">
        <Users className="h-8 w-8 text-pink-400" />
        Users & Profiles
      </h1>
      <p className="mb-6 text-neutral-300">Read-only overview of all users</p>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by email, username, or display name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Total Users</div>
          <div className="text-2xl font-bold text-white">{users.length}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">NSFW Enabled</div>
          <div className="text-2xl font-bold text-pink-400">
            {users.filter((u) => u.nsfwEnabled).length}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Total Petals</div>
          <div className="text-2xl font-bold text-green-400">
            {users.reduce((sum, u) => sum + u.petalBalance, 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Total Lifetime Earned</div>
          <div className="text-2xl font-bold text-cyan-400">
            {users.reduce((sum, u) => sum + u.lifetimePetalsEarned, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-black/30">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Username</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Display Name
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-white">Balance</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-white">Lifetime</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">NSFW</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                    {searchQuery ? 'No users found matching your search' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-neutral-300">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-neutral-300">{user.username}</td>
                    <td className="px-4 py-3 text-sm text-neutral-300">
                      {user.displayName || <span className="text-neutral-500">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-green-400">
                      {user.petalBalance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-cyan-400">
                      {user.lifetimePetalsEarned.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.nsfwEnabled ? (
                        <span className="inline-flex items-center rounded-full bg-pink-500/20 px-2 py-1 text-xs text-pink-300">
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-neutral-700/50 px-2 py-1 text-xs text-neutral-400">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
