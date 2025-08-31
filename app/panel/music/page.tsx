/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Heart, List } from 'lucide-react';
import Link from 'next/link';

export default function MusicPanel() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, [false, 500]);

  const playlist = [
    {
      id: 1,
      title: 'Sakura Dreams',
      artist: 'Anime OST',
      duration: '3:45',
      genre: 'Ambient',
    },
    {
      id: 2,
      title: 'Neon Nights',
      artist: 'Cyberpunk Beats',
      duration: '4:12',
      genre: 'Electronic',
    },
    {
      id: 3,
      title: 'Cherry Blossom Waltz',
      artist: 'Classical Fusion',
      duration: '5:23',
      genre: 'Classical',
    },
    {
      id: 4,
      title: 'Digital Rain',
      artist: 'Matrix Vibes',
      duration: '3:58',
      genre: 'Synthwave',
    },
  ];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading Music Player...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Music Player</h1>
          </div>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Enjoy curated playlists and discover new music while you explore Otakumori.
          </p>
        </div>

        {/* Now Playing */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Now Playing</h2>
          <div className="text-center mb-8">
            <div className="w-64 h-64 mx-auto mb-6 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center">
              <Music className="h-24 w-24 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {playlist[currentTrack].title}
            </h3>
            <p className="text-neutral-300 mb-1">{playlist[currentTrack].artist}</p>
            <p className="text-sm text-neutral-400">{playlist[currentTrack].genre}</p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={prevTrack}
              className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              <SkipBack className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              <SkipForward className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-800 rounded-full h-2 mb-4">
            <div className="bg-purple-500 h-2 rounded-full w-1/3"></div>
          </div>

          <div className="flex justify-between text-sm text-neutral-400">
            <span>1:23</span>
            <span>{playlist[currentTrack].duration}</span>
          </div>
        </div>

        {/* Playlist */}
        <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700 rounded-xl p-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Playlist</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <List className="h-4 w-4" />
              View All
            </button>
          </div>

          <div className="space-y-3">
            {playlist.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer ${
                  index === currentTrack
                    ? 'bg-purple-600/20 border border-purple-500/30'
                    : 'bg-neutral-800/50 hover:bg-neutral-700/50'
                }`}
                onClick={() => setCurrentTrack(index)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-700 rounded flex items-center justify-center">
                    {index === currentTrack ? (
                      <Music className="h-5 w-5 text-purple-400" />
                    ) : (
                      <span className="text-sm text-neutral-400">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{track.title}</h4>
                    <p className="text-sm text-neutral-400">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-400">{track.duration}</span>
                  <button className="p-2 rounded hover:bg-neutral-700 transition-colors">
                    <Heart className="h-4 w-4 text-neutral-400 hover:text-pink-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Music Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Custom Playlists */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-white mb-2">Custom Playlists</h3>
            <p className="text-neutral-300 mb-4">Create and share your own playlists</p>
            <Link
              href="/panel/music/playlists"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Playlist
            </Link>
          </div>

          {/* Music Discovery */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">Music Discovery</h3>
            <p className="text-neutral-300 mb-4">Discover new music based on your taste</p>
            <Link
              href="/panel/music/discover"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Discover Music
            </Link>
          </div>

          {/* Music Settings */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Music Settings</h3>
            <p className="text-neutral-300 mb-4">Customize your music experience</p>
            <Link
              href="/panel/music/settings"
              className="inline-block px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
            >
              Configure
            </Link>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">🎵 Full Music Experience Coming Soon</h2>
          <p className="text-neutral-300 mb-6">
            We're working on bringing you a complete music streaming experience with custom
            playlists, music discovery, and social features!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/panel/petal-store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Music className="h-4 w-4" />
              Get Music Cosmetics
            </Link>
            <Link
              href="/mini-games"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Play className="h-4 w-4" />
              Play Mini-Games
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
