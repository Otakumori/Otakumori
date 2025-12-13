'use client';

import { logger } from '@/app/lib/logger';
import React, { useState, useEffect } from 'react';
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
      logger.error('Soapstone submit error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hide footer during GameCube boot animation
  const [hideFooter, setHideFooter] = useState(false);
  
  useEffect(() => {
    const checkBootAnimation = () => {
      const bootElement = document.querySelector('[data-gamecube-boot="true"]');
      const shouldHide = !!bootElement;
      setHideFooter(shouldHide);
    };
    
    // Check initially
    checkBootAnimation();
    
    // Watch for boot animation changes
    const observer = new MutationObserver(checkBootAnimation);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  if (hideFooter) {
    return null;
  }

  return (
    <footer
      className="relative backdrop-blur-lg border-t border-white/10"
      style={{ backgroundColor: 'rgba(57, 5, 40, 0.8)', zIndex: 40 }}
    >
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Compact Soapstone Input */}
        <section className="mx-auto mt-16 max-w-4xl px-4 pb-10">
          <div className="border border-[var(--om-border-soft)] bg-[var(--om-bg-surface)] px-4 py-4 rounded-xl">
            <form onSubmit={handleSoapstoneSubmit} className="max-w-2xl mx-auto">
              <label htmlFor="soapstone-input" className="block text-[var(--om-text-ivory)] text-sm mb-2">
                Leave a sign for fellow travelers
              </label>
              <div className="flex gap-2">
                <input
                  id="soapstone-input"
                  type="text"
                  value={soapstoneText}
                  onChange={(e) => setSoapstoneText(e.target.value)}
                  placeholder="Compose a sign…"
                  maxLength={140}
                  className="flex-1 px-4 py-3 bg-[var(--om-bg-root)] border border-[var(--om-border-soft)] rounded-xl text-[var(--om-text-ivory)] placeholder-[var(--om-text-ivory)]/50 focus:outline-none focus:border-[var(--om-accent-pink)] focus:ring-2 focus:ring-[var(--om-accent-pink)]/30 text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={!soapstoneText.trim() || isSubmitting}
                  className="px-8 py-3 bg-[var(--om-bg-surface)] border border-[var(--om-border-strong)] text-[var(--om-text-ivory)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-all hover:bg-[var(--om-accent-pink)]/10 hover:border-[var(--om-accent-pink)] active:scale-95"
                >
                  {isSubmitting ? 'Carving...' : 'Carve Sign'}
                </button>
              </div>
            </form>
          </div>
        </section>

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
