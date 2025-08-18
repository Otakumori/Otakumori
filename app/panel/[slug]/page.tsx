import config from "@/data/gamecube.config";
import { notFound } from "next/navigation";
import MemoryCardsDock from "@/components/gamecube/MemoryCardsDock";
import { playlist } from "@/data/music.config";

export default function PanelPage({ params }: { params: { slug: string } }) {
  const face = config.faces.find(f => f.slug === params.slug);
  
  if (!face) {
    notFound();
  }

  const renderContent = () => {
    switch (face.slug) {
      case "trade":
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Trade Center</h1>
            <p className="text-xl text-gray-300 mb-8">Barter in the Scarlet Bazaar</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-pink-500/20 p-6 rounded-lg border border-pink-300/30">
                <h3 className="text-xl font-bold text-white mb-2">Shop</h3>
                <p className="text-gray-300">Browse available items</p>
              </div>
              <div className="bg-purple-500/20 p-6 rounded-lg border border-purple-300/30">
                <h3 className="text-xl font-bold text-white mb-2">Trading</h3>
                <p className="text-gray-300">Exchange with other players</p>
              </div>
              <div className="bg-blue-500/20 p-6 rounded-lg border border-blue-300/30">
                <h3 className="text-xl font-bold text-white mb-2">Inventory</h3>
                <p className="text-gray-300">Manage your collection</p>
              </div>
            </div>
          </div>
        );
      
      case "mini-games":
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Mini-Games</h1>
            <p className="text-xl text-gray-300 mb-8">Seasonal • Arcade</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {config.games.map((game) => (
                <div key={game.slug} className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-4 rounded-lg border border-pink-300/30 hover:border-pink-300 transition-colors">
                  <h3 className="text-lg font-bold text-white mb-2">{game.title}</h3>
                  <p className="text-sm text-gray-300">{game.shortPrompt}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case "community":
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Avatar / Community Hub</h1>
            <p className="text-xl text-gray-300 mb-8">Avatars • Social</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-pink-500/20 p-6 rounded-lg border border-pink-300/30">
                <h3 className="text-xl font-bold text-white mb-2">Avatar Customization</h3>
                <p className="text-gray-300">Create your unique character</p>
              </div>
              <div className="bg-purple-500/20 p-6 rounded-lg border border-purple-300/30">
                <h3 className="text-xl font-bold text-white mb-2">Community</h3>
                <p className="text-gray-300">Connect with other players</p>
              </div>
            </div>
          </div>
        );
      
      case "music":
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Music / Extras</h1>
            <p className="text-xl text-gray-300 mb-8">OST • Bonus</p>
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-6 rounded-lg border border-pink-300/30">
                <h3 className="text-xl font-bold text-white mb-4">Playlist</h3>
                <div className="space-y-2">
                  {playlist.map((track) => (
                    <div key={track.code} className="flex justify-between items-center p-2 bg-black/20 rounded">
                      <span className="text-white">{track.title}</span>
                      <button className="bg-pink-600 hover:bg-pink-700 px-3 py-1 rounded text-sm">
                        Play
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case "about":
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">About</h1>
            <p className="text-xl text-gray-300 mb-8">Welcome to Otaku-mori</p>
            <div className="max-w-3xl mx-auto text-left">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-6 rounded-lg border border-pink-300/30">
                <p className="text-gray-300 mb-4">
                  Otaku-mori is a unique gaming platform that combines the nostalgic feel of classic gaming consoles with modern web technology.
                </p>
                <p className="text-gray-300 mb-4">
                  Experience the magic of the GameCube interface, complete with mini-games, trading systems, and a vibrant community.
                </p>
                <p className="text-gray-300">
                  Where Petals Meet Power-Ups
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Unknown panel</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {renderContent()}
        <MemoryCardsDock />
      </div>
    </div>
  );
}
