'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import { useSessionToken } from '@/lib/authToken';

interface SoapstoneMessage {
  id: number;
  message: string;
  runeUrl: string;
  x: number;
  y: number;
  timestamp: number;
}

export function SoapstoneFooter() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<SoapstoneMessage[]>([]);
  const [_isVisible, _setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const getToken = useSessionToken();

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      const token = await getToken();

      if (token) {
        // Send to API
        const response = await fetch('/api/soapstones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message.trim() }),
        });

        if (response.ok) {
          const data = await response.json();
          createFloatingMessage(message.trim(), data.rune_sprite_url);
        } else {
          const error = await response.json();
          console.error('Failed to send soapstone:', error);
          // Still show the message locally for better UX
          createFloatingMessage(message.trim(), generateRuneSprite(message.trim()));
        }
      } else {
        // Not authenticated, just show locally
        createFloatingMessage(message.trim(), generateRuneSprite(message.trim()));
      }

      setMessage('');
    } catch (error) {
      console.error('Error sending soapstone:', error);
      // Show message locally on error
      createFloatingMessage(message.trim(), generateRuneSprite(message.trim()));
    } finally {
      setIsSubmitting(false);
    }
  };

  const createFloatingMessage = (msg: string, runeUrl: string) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Random position within safe container bounds
    const x = Math.random() * (rect.width - 100) + 50;
    const y = Math.random() * (rect.height - 100) + 50;

    const newMessage: SoapstoneMessage = {
      id: Date.now(),
      message: msg,
      runeUrl,
      x,
      y,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Remove message after animation
    setTimeout(
      () => {
        setMessages((prev) => prev.filter((m) => m.id !== newMessage.id));
      },
      prefersReducedMotion ? 3000 : 5000,
    );
  };

  const generateRuneSprite = (text: string): string => {
    // Simple rune generation (same as API)
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff;
      return a;
    }, 0);

    const runeType = Math.abs(hash) % 5;
    const color = ['#ff69b4', '#ff1493', '#ff69b4', '#ff1493', '#ff69b4'][runeType];

    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" opacity="0.8"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-family="monospace">
          ${text.charAt(0).toUpperCase()}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Clean up old messages
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessages((prev) => prev.filter((m) => now - m.timestamp < 10000)); // Keep for 10 seconds
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-neutral-950 border-t border-pink-500/30 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Soapstone Input */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-pink-400 mb-4 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 mr-2" />
            Leave a Soapstone Message
          </h3>
          <p className="text-neutral-400 mb-6 max-w-2xl mx-auto">
            Share your thoughts with the community. Messages become magical runes that float across
            the site.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a soapstone message..."
                maxLength={140}
                className="flex-1 px-4 py-3 bg-neutral-800 border border-pink-500/30 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                disabled={isSubmitting}
                name="soapstone"
                aria-label="Soapstone message"
              />
              <button
                type="submit"
                disabled={!message.trim() || isSubmitting}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="text-xs text-neutral-500 mt-2">
              {message.length}/140 characters • No emojis allowed
            </div>
          </form>
        </div>

        {/* Floating Messages Container */}
        <div
          ref={containerRef}
          className="relative h-64 border border-pink-500/20 rounded-lg bg-neutral-900/50 overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
            <p className="text-sm">Your runes will appear here...</p>
          </div>

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className="absolute"
                style={{ left: msg.x, top: msg.y }}
                initial={{
                  scale: 0,
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: prefersReducedMotion ? 0 : -20,
                }}
                exit={{
                  scale: 0,
                  opacity: 0,
                  y: -40,
                }}
                transition={{
                  duration: prefersReducedMotion ? 0.3 : 1.2,
                  ease: 'easeOut',
                }}
              >
                <div className="relative group">
                  <img
                    src={msg.runeUrl}
                    alt="Rune"
                    className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
                    title={msg.message}
                  />
                  {/* Message tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {msg.message}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Links */}
        <div className="mt-8 pt-8 border-t border-pink-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
            <div>
              <h4 className="text-white font-semibold mb-3">Shop</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <a href="/shop/apparel" className="hover:text-pink-400 transition-colors">
                    Apparel
                  </a>
                </li>
                <li>
                  <a href="/shop/accessories" className="hover:text-pink-400 transition-colors">
                    Accessories
                  </a>
                </li>
                <li>
                  <a href="/shop/home-decor" className="hover:text-pink-400 transition-colors">
                    Home Decor
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <a href="/mini-games" className="hover:text-pink-400 transition-colors">
                    Mini-Games
                  </a>
                </li>
                <li>
                  <a href="/blog" className="hover:text-pink-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:text-pink-400 transition-colors">
                    About
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <a href="/terms" className="hover:text-pink-400 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-pink-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/data-deletion" className="hover:text-pink-400 transition-colors">
                    Data Deletion
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Connect</h4>
              <p className="text-sm text-neutral-400">Join our community of otaku enthusiasts</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-neutral-500 text-sm">
              © 2024 Otaku-mori. Made with{' '}
              <span role="img" aria-label="Red heart">
                ️
              </span>{' '}
              for the otaku community.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
