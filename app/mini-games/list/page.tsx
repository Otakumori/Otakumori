// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import { t } from '@/lib/microcopy';

export default function MiniGamesListPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">t("nav", "miniGames")</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Game 1</h2>
            <p className="text-gray-400 mb-4">Description of game 1</p>
            <button className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded transition-colors">
              Play
            </button>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Game 2</h2>
            <p className="text-gray-400 mb-4">Description of game 2</p>
            <button className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded transition-colors">
              Play
            </button>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Game 3</h2>
            <p className="text-gray-400 mb-4">Description of game 3</p>
            <button className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded transition-colors">
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
