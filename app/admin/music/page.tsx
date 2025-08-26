/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import AdminMusicClient from "./page.client";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Music Playlists</h1>
      <AdminMusicClient />
    </main>
  );
}
