'use client';

/**
 * Save Modal - Only loads Clerk when user wants to save
 * This keeps the main page fast and guest-friendly
 */

import { useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

interface SaveModalProps {
  config: any;
  onClose: () => void;
  }

export default function SaveModal({ config, onClose }: SaveModalProps) {
  const { isSignedIn, user } = useUser();
  const [characterName, setCharacterName] = useState('My Character');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!isSignedIn) return;

    setSaving(true);
    try {
      const response = await fetch('/api/v1/characters/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: characterName,
          config: config,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const exportJSON = () => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${characterName.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(JSON.stringify(config));
    alert('Copied to clipboard!');
  };

  const generateShareURL = () => {
    const encoded = btoa(JSON.stringify(config));
    const shareUrl = `${window.location.origin}/character?data=${encoded}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share URL copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-b from-purple-900 to-black rounded-2xl border border-pink-500/30 p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {saved ? (
          <div className="text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-white mb-2">Saved!</h3>
            <p className="text-pink-200">Your character has been saved to your account.</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-white mb-6">Save Your Character</h3>

            {!isSignedIn ? (
              <div className="space-y-4">
                <p className="text-pink-200 mb-4">
                  Sign in to save your character to your account and access it from any device!
                </p>

                <SignInButton mode="modal">
                  <button className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors">
                    Sign In to Save
                  </button>
                </SignInButton>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black text-white/60">or save locally</span>
                  </div>
                </div>

                <button
                  onClick={exportJSON}
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
                >
                  📥 Download as JSON
                </button>

                <button
                  onClick={copyToClipboard}
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
                >
                  📋 Copy to Clipboard
                </button>

                <button
                  onClick={generateShareURL}
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
                >
                  🔗 Generate Share Link
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-pink-200 mb-2">
                  Welcome back, {user?.firstName || 'traveler'}! 👋
                </p>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter a name..."
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : '💾 Save to Account'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={exportJSON}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 text-sm"
                  >
                    📥 Export
                  </button>
                  <button
                    onClick={generateShareURL}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 text-sm"
                  >
                    🔗 Share
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-6 w-full px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

