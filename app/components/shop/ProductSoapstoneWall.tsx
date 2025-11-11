'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToastContext } from '@/app/contexts/ToastContext';
import { HeaderButton } from '@/components/ui/header-button';

interface Soapstone {
  id: string;
  message: string;
  template?: string | null;
  praiseCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
}

interface ProductSoapstoneWallProps {
  productId: string;
}

const DARK_SOULS_TEMPLATES = [
  'Amazing chest ahead',
  'Try two-handing',
  "Don't give up, skeleton",
  'Visions of happiness...',
  'Praise the sun!',
  'Item ahead',
  'Be wary of tears',
  'Gorgeous view ahead',
  'Time for joy',
  'Could this be a treasure?',
];

export function ProductSoapstoneWall({ productId }: ProductSoapstoneWallProps) {
  const { user } = useUser();
  const { success, error: showError } = useToastContext();
  const [soapstones, setSoapstones] = useState<Soapstone[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [praisedIds, setPraisedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSoapstones();
  }, [productId]);

  const fetchSoapstones = async () => {
    try {
      const response = await fetch(
        `/api/v1/products/${productId}/soapstones?limit=20&sortBy=praise`,
      );
      if (response.ok) {
        const result = await response.json();
        setSoapstones(result.data?.soapstones || []);
      }
    } catch (err) {
      console.error('Failed to load soapstones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('Sign in to leave a sign for fellow travelers');
      return;
    }

    const finalMessage = selectedTemplate || message;
    if (!finalMessage.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/products/${productId}/soapstones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: finalMessage,
          template: selectedTemplate,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        success('Sign placed. May the sun shine upon you.');
        setMessage('');
        setSelectedTemplate(null);
        setComposing(false);
        fetchSoapstones();
      } else {
        showError(result.error || 'Failed to place sign');
      }
    } catch (err) {
      console.error('Failed to place sign', err);
      showError('Failed to place sign');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePraise = async (soapstoneId: string) => {
    if (!user) {
      showError('Sign in to send praise to other travelers');
      return;
    }

    try {
      const response = await fetch(`/api/v1/products/soapstones/${soapstoneId}/praise`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.ok) {
        setPraisedIds((prev) => {
          const next = new Set(prev);
          if (result.data.praised) {
            next.add(soapstoneId);
          } else {
            next.delete(soapstoneId);
          }
          return next;
        });

        setSoapstones((prev) =>
          prev.map((s) =>
            s.id === soapstoneId ? { ...s, praiseCount: result.data.praiseCount } : s,
          ),
        );
      }
    } catch (err) {
      console.error('Failed to praise:', err);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-20 bg-white/10 rounded" />
          <div className="h-20 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6 border-pink-500/20 shadow-2xl shadow-pink-500/10">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-pink-200 flex items-center gap-2">
          <span className="text-pink-400">⚔</span>
          What travelers say
        </h3>
        {!composing && (
          <HeaderButton
            type="button"
            onClick={() => setComposing(true)}
            className="px-6 py-2 text-sm font-semibold"
          >
            Leave a sign
          </HeaderButton>
        )}
      </div>

      {composing && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-white/10 pt-4">
          <div>
            <p className="block text-sm text-zinc-300 mb-2">Choose a template</p>
            <div className="grid grid-cols-2 gap-2">
              {DARK_SOULS_TEMPLATES.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setMessage(template);
                  }}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    selectedTemplate === template
                      ? 'bg-pink-500/20 border-pink-500/50 text-pink-200'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="soapstone-message" className="block text-sm text-zinc-300 mb-2">
              Or write your own
            </label>
            <textarea
              id="soapstone-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setSelectedTemplate(null);
              }}
              placeholder="Compose a sign..."
              maxLength={280}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-zinc-400 resize-none focus:border-pink-500/50 focus:outline-none"
            />
            <div className="text-xs text-zinc-400 mt-1">{message.length} / 280</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <HeaderButton
              type="submit"
              disabled={submitting || (!message.trim() && !selectedTemplate)}
              className="px-6 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {submitting ? 'Placing...' : 'Place Sign (5 petals)'}
            </HeaderButton>
            <HeaderButton
              type="button"
              onClick={() => {
                setComposing(false);
                setMessage('');
                setSelectedTemplate(null);
              }}
              className="px-4 py-2 text-sm font-semibold bg-white/15 hover:bg-white/25 border border-white/20 text-white"
            >
              Cancel
            </HeaderButton>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {soapstones.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <p>No signs yet. Be the first to guide fellow travelers.</p>
          </div>
        ) : (
          soapstones.map((stone) => (
            <div
              key={stone.id}
              className="relative bg-black/30 border border-white/10 rounded-xl p-4 hover:border-pink-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white text-base font-medium mb-2">{stone.message}</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>{stone.author.username}</span>
                    <span>•</span>
                    <span>{new Date(stone.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePraise(stone.id)}
                  disabled={!user}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                    praisedIds.has(stone.id)
                      ? 'bg-pink-500/20 text-pink-400'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-pink-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Praise this sign"
                >
                  <svg
                    className="w-5 h-5"
                    fill={praisedIds.has(stone.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span className="text-xs font-bold">{stone.praiseCount}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
