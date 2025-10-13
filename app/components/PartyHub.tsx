'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Gamepad2, MessageSquare, Settings } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import GlassButton from './ui/GlassButton';
import { type Party, type PartyCreate } from '@/app/lib/contracts';

interface PartyHubProps {
  className?: string;
}

export default function PartyHub({ className = '' }: PartyHubProps) {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newParty, setNewParty] = useState<Partial<PartyCreate>>({
    name: '',
    description: '',
    maxMembers: 4,
    isPublic: true,
    gameMode: 'mini-games',
  });

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/parties');
      const result = await response.json();

      if (result.ok) {
        setParties(result.data.parties);
      } else {
        console.error('Failed to load parties:', result.error);
      }
    } catch (error) {
      console.error('Error loading parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const createParty = async () => {
    try {
      const response = await fetch('/api/v1/parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParty),
      });

      const result = await response.json();

      if (result.ok) {
        setParties((prev) => [result.data, ...prev]);
        setShowCreateForm(false);
        setNewParty({
          name: '',
          description: '',
          maxMembers: 4,
          isPublic: true,
          gameMode: 'mini-games',
        });
      } else {
        console.error('Failed to create party:', result.error);
      }
    } catch (error) {
      console.error('Error creating party:', error);
    }
  };

  const getGameModeIcon = (gameMode?: string) => {
    switch (gameMode) {
      case 'mini-games':
        return <Gamepad2 className="w-4 h-4" />;
      case 'exploration':
        return <Users className="w-4 h-4" />;
      case 'social':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-green-400';
      case 'full':
        return 'text-yellow-400';
      case 'in-game':
        return 'text-blue-400';
      case 'closed':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <GlassCard className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-white/10 rounded mb-4"></div>
            <div className="h-4 bg-white/5 rounded mb-2"></div>
            <div className="h-4 bg-white/5 rounded w-3/4 mx-auto"></div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Party Hub</h2>
        <GlassButton
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Party
        </GlassButton>
      </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Party</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="partyName" className="block text-sm font-medium text-white/80 mb-2">
                  Party Name
                </label>
                <input
                  id="partyName"
                  type="text"
                  value={newParty.name}
                  onChange={(e) => setNewParty((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter party name..."
                />
              </div>

              <div>
                <label
                  htmlFor="partyDescription"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="partyDescription"
                  value={newParty.description}
                  onChange={(e) =>
                    setNewParty((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Describe your party..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="maxMembers"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    Max Members
                  </label>
                  <select
                    id="maxMembers"
                    value={newParty.maxMembers}
                    onChange={(e) =>
                      setNewParty((prev) => ({ ...prev, maxMembers: parseInt(e.target.value) }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    aria-label="Select"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="gameMode"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    Game Mode
                  </label>
                  <select
                    id="gameMode"
                    value={newParty.gameMode}
                    onChange={(e) =>
                      setNewParty((prev) => ({ ...prev, gameMode: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    aria-label="Select"
                  >
                    <option value="mini-games">Mini Games</option>
                    <option value="exploration">Exploration</option>
                    <option value="social">Social</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white/80">
                  <input
                    type="checkbox"
                    checked={newParty.isPublic}
                    onChange={(e) =>
                      setNewParty((prev) => ({ ...prev, isPublic: e.target.checked }))
                    }
                    className="rounded border-white/20 bg-white/10 text-pink-500 focus:ring-pink-500"
                  />
                  Public Party
                </label>
              </div>

              <div className="flex gap-3">
                <GlassButton onClick={createParty} disabled={!newParty.name}>
                  Create Party
                </GlassButton>
                <GlassButton variant="secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="grid gap-4">
        {parties.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Parties Found</h3>
            <p className="text-white/60 mb-4">
              Be the first to create a party and start playing together!
            </p>
            <GlassButton onClick={() => setShowCreateForm(true)}>Create First Party</GlassButton>
          </GlassCard>
        ) : (
          parties.map((party) => (
            <motion.div
              key={party.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{party.name}</h3>
                      <div className="flex items-center gap-1 text-white/60">
                        {getGameModeIcon(party.gameMode)}
                        <span className="text-sm capitalize">
                          {party.gameMode?.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    {party.description && <p className="text-white/70 mb-3">{party.description}</p>}

                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {party.memberCount || 0}/{party.maxMembers} members
                        </span>
                      </div>
                      <span className={`font-medium ${getStatusColor(party.status)}`}>
                        {party.status.replace('-', ' ')}
                      </span>
                      <span>by {party.leader?.username}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <GlassButton size="sm" variant="secondary">
                      View
                    </GlassButton>
                    {party.status === 'open' && <GlassButton size="sm">Join</GlassButton>}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
