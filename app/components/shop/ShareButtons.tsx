'use client';

import { useState } from 'react';
import { Share2, Twitter, MessageCircle, Link as LinkIcon, Check } from 'lucide-react';
import { useToastContext } from '@/app/contexts/ToastContext';

interface ShareButtonsProps {
  productTitle: string;
  productId: string;
}

export function ShareButtons({ productTitle, productId }: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { success } = useToastContext();

  const productUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/shop/product/${productId}` : '';
  const shareText = `Check out this treasure: ${productTitle}`;

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToDiscord = () => {
    // Discord doesn't have a share URL, but we can copy a formatted message
    const discordMessage = `${shareText}\n${productUrl}`;
    navigator.clipboard.writeText(discordMessage);
    success('Discord message copied! Paste it in your server 🎮');
    setIsOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      success('Link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
        aria-label="Share product"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-medium">Share</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />

          {/* Share menu */}
          <div className="absolute right-0 mt-2 z-50 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-2 min-w-[200px]">
            <button
              onClick={shareToTwitter}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 text-white transition-colors text-left"
            >
              <Twitter className="w-4 h-4" />
              <span className="text-sm">Share on Twitter</span>
            </button>

            <button
              onClick={shareToDiscord}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 text-white transition-colors text-left"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">Share on Discord</span>
            </button>

            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 text-white transition-colors text-left"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <LinkIcon className="w-4 h-4" />
              )}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
