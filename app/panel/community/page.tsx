/* eslint-disable react-hooks/exhaustive-deps */
 
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Users, User, MessageCircle, Heart, Star, Trophy, Coins } from 'lucide-react';
import Link from 'next/link';

export default function CommunityHubPanel() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, [false, 500]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading Community Hub...</p>
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
            <Users className="h-12 w-12 text-green-400" />
            <h1 className="text-4xl font-bold">Community Hub</h1>
          </div>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Connect with other players, customize your avatar, and participate in community events.
          </p>
        </div>

        {/* Community Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Avatar Customization */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-white mb-2">Avatar Customization</h3>
            <p className="text-neutral-300 mb-4">
              Customize your profile with cosmetics and overlays
            </p>
            <Link
              href="/panel/community/avatar"
              className="inline-block px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
            >
              Customize Avatar
            </Link>
          </div>

          {/* Community Chat */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Community Chat</h3>
            <p className="text-neutral-300 mb-4">Chat with other players and make new friends</p>
            <Link
              href="/panel/community/chat"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Join Chat
            </Link>
          </div>

          {/* Community Events */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-white mb-2">Community Events</h3>
            <p className="text-neutral-300 mb-4">Participate in seasonal events and challenges</p>
            <Link
              href="/panel/community/events"
              className="inline-block px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
            >
              View Events
            </Link>
          </div>

          {/* Leaderboards */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-2">Leaderboards</h3>
            <p className="text-neutral-300 mb-4">Compete with other players for top rankings</p>
            <Link
              href="/panel/community/leaderboards"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              View Rankings
            </Link>
          </div>

          {/* Friend System */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">Friend System</h3>
            <p className="text-neutral-300 mb-4">Add friends and see their activities</p>
            <Link
              href="/panel/community/friends"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              Manage Friends
            </Link>
          </div>

          {/* Community Guidelines */}
          <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-white mb-2">Community Guidelines</h3>
            <p className="text-neutral-300 mb-4">Learn about community rules and etiquette</p>
            <Link
              href="/panel/community/guidelines"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Read Guidelines
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        {user && (
          <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700 rounded-xl p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Community Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-blue-400">0</div>
                <div className="text-sm text-neutral-400">Friends</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-yellow-400">0</div>
                <div className="text-sm text-neutral-400">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌸</div>
                <div className="text-2xl font-bold text-pink-400">0</div>
                <div className="text-sm text-neutral-400">Petals Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-green-400">0</div>
                <div className="text-sm text-neutral-400">Community Rating</div>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">🚧 Community Features Coming Soon</h2>
          <p className="text-neutral-300 mb-6">
            We're building an amazing community experience! In the meantime, you can customize your
            avatar and visit the Petal Store.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/panel/petal-store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Coins className="h-4 w-4" />
              Petal Store
            </Link>
            <Link
              href="/mini-games"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Trophy className="h-4 w-4" />
              Mini-Games
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
