'use client';

import { logger } from '@/app/lib/logger';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import GlassPanel from '../GlassPanel';

type Soapstone = {
  id: string;
  message: string;
  author: string;
  createdAt: string;
  glowLevel: number;
  replies: number;
  isGlowing?: boolean;
  isReplying?: boolean;
};

type SoapstoneCommunityProps = {
  initialSoapstones: Soapstone[];
};

export default function SoapstoneCommunity({ initialSoapstones }: SoapstoneCommunityProps) {
  const { isSignedIn, getToken } = useAuth();
  const [soapstones, setSoapstones] = useState(initialSoapstones);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const maxCharacters = 280;
  const glowTimeoutRef = useRef<any>(undefined);

  // Cleanup glow timeout on unmount
  useEffect(() => {
    return () => {
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isSignedIn || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = await getToken({ template: 'otakumori-jwt' });
      const response = await fetch('/api/v1/community/soapstones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const newSoapstone = await response.json();

        // Add glow effect to the new message
        const glowingSoapstone = { ...newSoapstone, isGlowing: true };
        setSoapstones((prev) => [glowingSoapstone, ...prev]);

        // Remove glow after 3 seconds
        setTimeout(() => {
          setSoapstones((prev) =>
            prev.map((s) => (s.id === newSoapstone.id ? { ...s, isGlowing: false } : s)),
          );
        }, 3000);

        setNewMessage('');
        setCharacterCount(0);
      }
    } catch (error) {
      logger.error('Failed to post soapstone:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (soapstoneId: string) => {
    if (!isSignedIn) return;

    try {
      const token = await getToken({ template: 'otakumori-jwt' });
      const response = await fetch(`/api/v1/community/soapstones/${soapstoneId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        // Trigger pulse effect on the original message
        setSoapstones((prev) =>
          prev.map((s) =>
            s.id === soapstoneId ? { ...s, isReplying: true, replies: s.replies + 1 } : s,
          ),
        );

        // Remove pulse effect after 2 seconds
        setTimeout(() => {
          setSoapstones((prev) =>
            prev.map((s) => (s.id === soapstoneId ? { ...s, isReplying: false } : s)),
          );
        }, 2000);
      }
    } catch (error) {
      logger.error('Failed to reply to soapstone:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const getGlowIntensity = (glowLevel: number) => {
    if (glowLevel >= 10) return 'shadow-[0_0_30px_rgba(240,171,252,0.8)]';
    if (glowLevel >= 5) return 'shadow-[0_0_20px_rgba(240,171,252,0.6)]';
    if (glowLevel >= 2) return 'shadow-[0_0_15px_rgba(240,171,252,0.4)]';
    return 'shadow-[0_0_10px_rgba(240,171,252,0.2)]';
  };

  const getMessageColor = (glowLevel: number) => {
    if (glowLevel >= 10) return 'text-fuchsia-200';
    if (glowLevel >= 5) return 'text-fuchsia-300';
    if (glowLevel >= 2) return 'text-fuchsia-400';
    return 'text-zinc-300';
  };

  return (
    <div className="space-y-6">
      {/* Message Composer */}
      <GlassPanel className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Leave a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setCharacterCount(e.target.value.length);
              }}
              placeholder="Share your thoughts with other travelers..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none resize-none"
              rows={3}
              maxLength={maxCharacters}
              disabled={!isSignedIn || isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <div
                className={`text-sm ${characterCount > maxCharacters * 0.9 ? 'text-yellow-400' : 'text-zinc-400'}`}
              >
                {characterCount} / {maxCharacters}
              </div>
              {!isSignedIn && <p className="text-sm text-zinc-400">Sign in to leave messages</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={
              !newMessage.trim() || !isSignedIn || isSubmitting || characterCount > maxCharacters
            }
            className="rounded-xl bg-fuchsia-500/90 px-6 py-3 text-white hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Place Soapstone'}
          </button>
        </form>
      </GlassPanel>

      {/* Soapstone Messages */}
      <div className="space-y-4">
        {soapstones.map((soapstone) => (
          <GlassPanel
            key={soapstone.id}
            className={`p-4 transition-all duration-500 ${
              soapstone.isGlowing
                ? 'animate-pulse bg-fuchsia-500/10 border-fuchsia-400/50'
                : soapstone.isReplying
                  ? 'animate-pulse bg-purple-500/10 border-purple-400/50'
                  : ''
            } ${getGlowIntensity(soapstone.glowLevel)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                  <span className="text-sm text-fuchsia-300"></span>
                </div>
                <div>
                  <div className="font-medium text-white">{soapstone.author}</div>
                  <div className="text-xs text-zinc-400">
                    {new Date(soapstone.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Glow: {soapstone.glowLevel}</span>
                {soapstone.replies > 0 && (
                  <span className="text-xs text-purple-400">{soapstone.replies} replies</span>
                )}
              </div>
            </div>

            <p className={`mb-4 leading-relaxed ${getMessageColor(soapstone.glowLevel)}`}>
              {soapstone.message}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleReply(soapstone.id)}
                disabled={!isSignedIn}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span></span>
                Reply
              </button>

              <button className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors">
                <span></span>
                Rate
              </button>
            </div>
          </GlassPanel>
        ))}
      </div>

      {soapstones.length === 0 && (
        <div className="text-center py-12">
          <GlassPanel className="p-8">
            <h3 className="text-xl font-semibold text-white mb-4">No messages yet</h3>
            <p className="text-zinc-400">Be the first to leave a message for other travelers!</p>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
