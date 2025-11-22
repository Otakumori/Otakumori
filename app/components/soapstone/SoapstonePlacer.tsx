'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAuthContext } from '@/app/contexts/AuthContext';

interface SoapstonePlacerProps {
  onPlaceSuccess?: (message: { id: string; text: string; x: number; y: number }) => void;
}

/**
 * Component for placing Dark Souls-style soapstone messages
 * Click anywhere to place a sign
 */
export default function SoapstonePlacer({ onPlaceSuccess }: SoapstonePlacerProps) {
  const { user } = useUser();
  const { requireAuthForSoapstone } = useAuthContext();
  const [isPlacing, setIsPlacing] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [text, setText] = useState('');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceClick = useCallback(
    async (e: React.MouseEvent) => {
      // Only allow placing if composer is open
      if (!showComposer) return;

      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        requireAuthForSoapstone(() => {
          // After sign-in callback
        });
        return;
      }

      // Get click position relative to viewport
      const x = e.clientX;
      const y = e.clientY;

      setPosition({ x, y });
    },
    [showComposer, user, requireAuthForSoapstone],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!text.trim() || !position || isPlacing || !user) return;

      setIsPlacing(true);
      setError(null);

      try {
        // Generate idempotency key
        const idempotencyKey = `soapstone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const response = await fetch('/api/v1/soapstone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-idempotency-key': idempotencyKey,
          },
          body: JSON.stringify({
            body: text.trim(),
            x: Math.round(position.x),
            y: Math.round(position.y),
          } as { body: string; x: number; y: number }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.ok && result.data) {
          setText('');
          setShowComposer(false);
          setPosition(null);

          if (onPlaceSuccess) {
            onPlaceSuccess({
              id: result.data.id,
              text: result.data.body || text.trim(),
              x: position.x,
              y: position.y,
            });
          }
        } else {
          throw new Error(result.error || 'Failed to create soapstone');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to place soapstone');
      } finally {
        setIsPlacing(false);
      }
    },
    [text, position, isPlacing, user, onPlaceSuccess],
  );

  const remainingChars = 280 - text.length;
  const isOverLimit = remainingChars < 0;

  const handleOverlayKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowComposer(false);
    }
  }, []);

  if (showComposer) {
    return (
      <div
        className="fixed inset-0 z-50 pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Place a soapstone sign"
      >
        {/* Clickable overlay for positioning */}
        <button
          type="button"
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onClick={handlePlaceClick}
          onKeyDown={handleOverlayKeyDown}
          aria-label="Click to position soapstone sign"
        >
          <span className="sr-only">Click anywhere to position your soapstone sign</span>
        </button>
        {/* Overlay with instructions */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-none" />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-900/95 border border-pink-400/30 rounded-xl p-4 shadow-2xl max-w-md w-full mx-4 z-50">
          <h3 className="text-lg font-bold text-pink-200 mb-2">Place a Sign</h3>
          <p className="text-sm text-pink-200/70 mb-4">
            Click anywhere on the page to position your soapstone, then compose your message.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="soapstone-text"
                className="block text-sm font-medium text-pink-200 mb-2"
              >
                Compose a sign…
              </label>
              <textarea
                id="soapstone-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isPlacing}
                placeholder="Leave a message for fellow travelers..."
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-pink-200/50 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                rows={3}
                maxLength={280}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-pink-200/50'}`}>
                  {remainingChars} characters remaining
                </span>
                {isOverLimit && <span className="text-xs text-red-400">Message too long</span>}
              </div>
            </div>

            {position && (
              <div className="text-xs text-pink-200/60 bg-pink-500/10 border border-pink-500/20 rounded-lg p-2">
                Position: {Math.round(position.x)}, {Math.round(position.y)}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComposer(false);
                  setText('');
                  setPosition(null);
                  setError(null);
                }}
                className="px-4 py-2 text-sm text-pink-200 hover:text-pink-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPlacing || !text.trim() || isOverLimit || !position}
                className="px-4 py-2 text-sm bg-pink-600 hover:bg-pink-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {isPlacing ? 'Placing...' : 'Leave Sign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (!user) {
          requireAuthForSoapstone(() => {
            // After sign-in, open composer
            setShowComposer(true);
          });
        } else {
          setShowComposer(true);
        }
      }}
      className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-pink-600/90 hover:bg-pink-500/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 backdrop-blur-sm border border-pink-400/30"
      aria-label="Place a soapstone sign"
    >
      <span className="text-xl">✦</span>
      <span className="text-sm font-medium">Leave a Sign</span>
    </button>
  );
}
