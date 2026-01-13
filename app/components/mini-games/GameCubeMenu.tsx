'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Game {
  id: string;
  title: string;
  thumbnail: string;
  slug?: string;
  href?: string;
}

interface GameCubeMenuProps {
  games: Game[];
  onGameSelect?: (game: Game) => void;
}

export function GameCubeMenu({ games, onGameSelect }: GameCubeMenuProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const router = useRouter();

  const handleGameClick = (game: Game) => {
    setSelectedGame(game.id);
    if (onGameSelect) {
      onGameSelect(game);
    } else if (game.href) {
      router.push(game.href);
    } else if (game.slug) {
      router.push(`/mini-games/${game.slug}`);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {games.map((game, index) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{
            delay: index * 0.1,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          whileHover={{ scale: 1.05, rotateY: 5 }}
          onClick={() => handleGameClick(game)}
          className="relative cursor-pointer perspective-1000"
        >
          <motion.div
            className="preserve-3d relative w-full aspect-square"
            animate={{ rotateY: selectedGame === game.id ? 180 : 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden bg-white/10 border border-white/20">
              <div className="relative w-full h-full">
                <Image
                  src={game.thumbnail}
                  alt={game.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-sm">{game.title}</h3>
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
              <span className="text-white font-bold">Play →</span>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

