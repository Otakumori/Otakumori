'use client';

import React, { useState } from 'react';

export default function Footer() {
  const [soapstoneText, setSoapstoneText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSoapstoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soapstoneText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/soapstone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: soapstoneText }),
      });

      if (res.ok) {
        setMessage('Sign left for travelers ✓');
        setSoapstoneText('');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to leave sign');
      }
    } catch (error) {
      setMessage('Error leaving sign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      className="backdrop-blur-lg border-t border-white/10"
      style={{ backgroundColor: 'rgba(57, 5, 40, 0.8)' }}
    >
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Compact Soapstone Input */}
        <div className="mb-8">
          <form onSubmit={handleSoapstoneSubmit} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={soapstoneText}
                onChange={(e) => setSoapstoneText(e.target.value)}
                placeholder="Leave a sign for fellow travelers..."
                maxLength={140}
                className="flex-1 px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400/50 text-sm"
              />
              <button
                type="submit"
                disabled={!soapstoneText.trim() || isSubmitting}
                className="px-6 py-2 bg-pink-500/20 border border-pink-400/30 text-pink-100 rounded-lg hover:bg-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
            {message && (
              <p className={`text-center mt-2 text-sm ${message.includes('✓') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Otaku-mori</h3>
            <p className="text-gray-300 text-sm">Discover treasures from the digital abyss</p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-gray-300 hover:text-white text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/returns" className="text-gray-300 hover:text-white text-sm">
                  Returns
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-gray-300 hover:text-white text-sm">
                  Cookie Settings
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="/community" className="text-gray-300 hover:text-white text-sm">
                  Community
                </a>
              </li>
              <li>
                <a href="/glossary" className="text-gray-300 hover:text-white text-sm">
                  Glossary
                </a>
              </li>
              <li>
                <a href="/community/soapstones" className="text-gray-300 hover:text-white text-sm">
                  View All Signs
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
