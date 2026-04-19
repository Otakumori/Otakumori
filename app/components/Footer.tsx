'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useToastContext } from '@/app/contexts/ToastContext';
import { useAuthContext } from '@/app/contexts/AuthContext';
import { paths } from '@/lib/paths';
import { GlowingSocialIcons } from './footer/GlowingSocialIcons';
import { AnimatedInput } from './ui/AnimatedInput';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

export default function Footer() {
  const { user } = useUser();
  const { requireAuthForSoapstone } = useAuthContext();
  const [soapstoneText, setSoapstoneText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useToastContext();

  const handleSoapstoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soapstoneText.trim() || isSubmitting) return;

    if (!user) {
      requireAuthForSoapstone(() => {
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
      getLogger().then((logger) => {
        logger.error('Soapstone submit error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [hideFooter, setHideFooter] = useState(false);
  
  useEffect(() => {
    const checkBootAnimation = () => {
      const bootElement = document.querySelector('[data-gamecube-boot="true"]');
      const shouldHide = !!bootElement;
      setHideFooter(shouldHide);
    };
    
    checkBootAnimation();
    
    const observer = new MutationObserver(checkBootAnimation);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  if (hideFooter) {
    return null;
  }

  return (
    <footer
      className="relative backdrop-blur-md border-t"
      style={{ 
        backgroundColor: 'var(--color-footer-muted)',
        borderColor: 'var(--color-border-muted)',
        zIndex: 40,
        backgroundImage: `linear-gradient(to top, var(--color-footer-muted) 0%, var(--color-footer-muted) 50%, transparent 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <section className="mx-auto mt-16 max-w-4xl px-4 pb-10">
          <div className="border border-[var(--om-border-soft)] bg-[var(--om-bg-surface)] px-4 py-4 rounded-xl">
            <form onSubmit={handleSoapstoneSubmit} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1">
                  <AnimatedInput
                    id="soapstone-input"
                    type="text"
                    label="Leave a sign for fellow travelers"
                    value={soapstoneText}
                    onChange={(e) => setSoapstoneText(e.target.value)}
                    placeholder="Compose a sign…"
                    maxLength={140}
                    className="bg-[var(--om-bg-root)] border-[var(--om-border-soft)] text-[var(--om-text-ivory)] placeholder-[var(--om-text-ivory)]/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!soapstoneText.trim() || isSubmitting}
                  className="px-8 py-3 bg-[var(--om-bg-surface)] border border-[var(--om-border-strong)] text-[var(--om-text-ivory)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-all hover:bg-[var(--om-accent-pink)]/10 hover:border-[var(--om-accent-pink)] active:scale-95 self-end"
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
                <Link href={paths.shop()} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href={paths.games()} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Mini-Games
                </Link>
              </li>
              <li>
                <Link href={paths.blogIndex()} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Blog: Read the lore
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href={paths.help()} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href={paths.privacy()} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={paths.terms()} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 mb-4">
              <li>
                <Link href={paths.community()} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href={paths.soapstones()} className="text-gray-300 hover:text-white text-sm transition-colors">
                  View All Signs
                </Link>
              </li>
              <li>
                <Link href={paths.cookies()} className="text-gray-300 hover:text-white text-sm transition-colors">
                  Cookie Settings
                </Link>
              </li>
            </ul>
            <GlowingSocialIcons />
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
