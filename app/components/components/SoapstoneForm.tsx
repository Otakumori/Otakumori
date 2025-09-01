 
 
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function SoapstoneForm() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!user) {
        throw new Error('You must be signed in to leave a message');
      }

      const response = await fetch('/api/soapstones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          rotation: Math.random() * 10 - 5, // Random rotation for visual variety
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('');
        setError('Message carved successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setError(''), 3000);
      } else {
        throw new Error(result.error || 'Failed to leave message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave your message, Ashen One..."
          className="h-32 w-full rounded-lg border border-pink-500/30 bg-gray-800/80 p-4 text-pink-200 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
          maxLength={200}
        />
        <div className="absolute bottom-2 right-2 text-sm text-gray-500">{message.length}/200</div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <button
        type="submit"
        disabled={isSubmitting || !message.trim()}
        className="w-full rounded-lg bg-pink-600 px-4 py-2 font-medium text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Carving...' : 'Carve Message'}
      </button>
    </form>
  );
}
