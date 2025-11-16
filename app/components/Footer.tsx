'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToastContext } from '@/app/contexts/ToastContext';
import { useAuthContext } from '@/app/contexts/AuthContext';

export default function Footer() {
  const { user } = useUser();
  const { requireAuthForSoapstone } = useAuthContext();
  const [soapstoneText, setSoapstoneText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useToastContext();

  const handleSoapstoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soapstoneText.trim() || isSubmitting) return;

    // Check auth before submitting
    if (!user) {
      requireAuthForSoapstone(() => {
        // After sign-in, user can try again
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/soapstone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: soapstoneText }),
      });

      if (res.ok) {
        success('Sign carved into the earth. May it guide others.');
        setSoapstoneText('');
      } else {
        const result = await res.json();
        showError(result.error || 'Failed to leave sign');
      }
    } catch (error) {
      showError('Failed to connect. Try again, chosen undead.');
      console.error('Soapstone submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      className="relative backdrop-blur-lg border-t border-white/10"
      style={{ backgroundColor: 'rgba(57, 5, 40, 0.8)', zIndex: 50 }}
    >
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Compact Soapstone Input */}
        <div className="mb-8 relative z-10">
          <form onSubmit={handleSoapstoneSubmit} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={soapstoneText}
                onChange={(e) => setSoapstoneText(e.target.value)}
                placeholder="Leave a sign for fellow travelers..."
                maxLength={140}
                className="flex-1 px-4 py-3 bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400/70 focus:ring-2 focus:ring-pink-500/30 focus:shadow-lg focus:shadow-pink-500/20 text-sm transition-all"
              />
              <button
                type="submit"
                disabled={!soapstoneText.trim() || isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-pink-500/40 to-purple-500/40 hover:from-pink-500/60 hover:to-purple-500/60 border border-pink-400/40 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-all shadow-lg hover:shadow-pink-500/40 hover:scale-105 active:scale-95"
              >
                {isSubmitting ? 'Carving...' : 'Carve Sign'}
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Otaku-mori</h3>
            <p className="text-gray-300 text-sm">Anime x gaming — curated treasures</p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/shop"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="/mini-games"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Mini-Games
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Blog: Read the lore
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/help"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/community"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="/community/soapstones"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  View All Signs
                </a>
              </li>
              <li>
                <a
                  href="/cookies"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Cookie Settings
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="text-gray-300 text-sm text-center space-y-2">
            <p>Otaku-mori ™ made with ♡</p>
            <p className="text-xs">
              © {new Date().getFullYear()} Otaku-mori. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
