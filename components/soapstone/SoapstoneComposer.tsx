'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAuthContext } from '@/app/contexts/AuthContext';

interface SoapstoneComposerProps {
  disabled?: boolean;
  disabledMessage?: string;
  onSubmit?: (text: string) => Promise<void>;
}

export default function SoapstoneComposer({
  disabled = false,
  disabledMessage,
  onSubmit,
}: SoapstoneComposerProps) {
  const { user } = useUser();
  const { requireAuthForSoapstone } = useAuthContext();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (disabled || !text.trim() || isSubmitting) return;

      // Check auth before submitting
      if (!user) {
        requireAuthForSoapstone(() => {
          // After sign-in, user can try again
        });
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      try {
        // Generate idempotency key
        const idempotencyKey = `soapstone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const response = await fetch('/api/soapstone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-idempotency-key': idempotencyKey,
          },
          body: JSON.stringify({ text: text.trim() }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.ok) {
          setText('');
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);

          // Call custom onSubmit if provided
          if (onSubmit) {
            await onSubmit(text.trim());
          }
        } else {
          throw new Error(result.error || 'Failed to create soapstone');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create soapstone');
      } finally {
        setIsSubmitting(false);
      }
    },
    [text, disabled, isSubmitting, onSubmit],
  );

  const remainingChars = 140 - text.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="soapstone-text" className="block text-sm font-medium text-pink-200 mb-2">
            Compose a sign…
          </label>
          <textarea
            id="soapstone-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled || isSubmitting}
            placeholder="Leave a message for fellow travelers..."
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-pink-200/50 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            rows={3}
            maxLength={140}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-pink-200/50'}`}>
              {remainingChars} characters remaining
            </span>
            {isOverLimit && <span className="text-xs text-red-400">Message too long</span>}
          </div>
        </div>

        {disabledMessage && (
          <div className="text-sm text-pink-200/70 bg-pink-500/20 border border-pink-500/30 rounded-lg p-3">
            {disabledMessage}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-400 bg-green-500/20 border border-green-500/30 rounded-lg p-3">
            Soapstone created successfully!
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={disabled || isSubmitting || !text.trim() || isOverLimit}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Leave Sign'}
          </button>
        </div>
      </form>
    </div>
  );
}
