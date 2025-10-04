'use client';

import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function AdminSoapstones() {
  const { data, mutate } = useSWR('/api/soapstones?all=1', fetcher);
  const list = data?.list ?? [];
  const meLikes: Record<string, true> = data?.meLikes ?? {};

  async function act(id: string, data: any) {
    const res = await fetch(`/api/soapstones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) mutate();
  }

  async function del(id: string) {
    if (!confirm('Delete this rune?')) return;
    const res = await fetch(`/api/soapstones/${id}`, { method: 'DELETE' });
    if (res.ok) mutate();
  }

  return (
    <div className="mx-auto max-w-5xl p-6 text-pink-100">
      <h1 className="mb-4 text-2xl font-semibold">Soapstones – Moderation</h1>
      <table className="w-full border-separate border-spacing-y-2">
        <thead className="text-left text-pink-200/70">
          <tr>
            <th className="px-3">Content</th>
            <th className="px-3 w-28">Upvotes</th>
            <th className="px-3 w-28">Flags</th>
            <th className="px-3 w-20">Liked</th>
            <th className="px-3 w-56">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((m: any) => (
            <tr
              key={m.id}
              className={`rounded-xl ${meLikes[m.id] ? 'bg-pink-500/20 border border-pink-400/40' : 'bg-[#121016]/80'}`}
            >
              <td className="px-3 py-3">{m.content}</td>
              <td className="px-3">{m.upvotes ?? 0}</td>
              <td className="px-3">{m.isFlagged ? '' : ''}</td>
              <td className="px-3">
                {meLikes[m.id] && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/20 px-2 py-1 text-xs text-pink-300">
                     Liked
                  </span>
                )}
              </td>
              <td className="px-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => act(m.id, { isHidden: !m.isHidden })}
                    className="rounded-lg border border-pink-300/30 px-2 py-1 hover:bg-pink-300/10"
                  >
                    {m.isHidden ? 'Unhide' : 'Hide'}
                  </button>
                  <button
                    onClick={() => act(m.id, { isFlagged: !m.isFlagged })}
                    className="rounded-lg border border-pink-300/30 px-2 py-1 hover:bg-pink-300/10"
                  >
                    {m.isFlagged ? 'Unflag' : 'Flag'}
                  </button>
                  <button
                    onClick={() => del(m.id)}
                    className="rounded-lg border border-red-400/40 px-2 py-1 text-red-300 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!list.length && (
            <tr>
              <td className="px-3 py-6 text-pink-300/60" colSpan={5}>
                No messages yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
