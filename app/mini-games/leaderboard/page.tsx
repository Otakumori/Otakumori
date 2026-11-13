import Link from 'next/link';
import { LeaderboardsTab } from '@/app/community/_components/LeaderboardsTab';

export const metadata = {
  title: 'Game Leaderboards | Otaku-mori',
  description: 'Persisted Otaku-mori game scores and Petal standings.',
};

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-pink-300">Hall of Records</p>
          <h1 className="mt-2 text-4xl font-semibold">Leaderboards</h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Every displayed score and rank comes from the persisted leaderboard authority.
          </p>
        </header>
        <LeaderboardsTab />
        <div className="mt-8">
          <Link className="text-pink-300 underline underline-offset-4" href="/mini-games">
            Return to the game hall
          </Link>
        </div>
      </div>
    </main>
  );
}
