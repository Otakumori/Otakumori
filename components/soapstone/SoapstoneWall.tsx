'use client';

import { useState } from 'react';

interface SoapstoneMessage {
  id: string;
  text: string;
  score: number;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface SoapstoneWallProps {
  messages: SoapstoneMessage[];
  maxDisplay?: number;
}

export default function SoapstoneWall({ messages, maxDisplay = 10 }: SoapstoneWallProps) {
  const [revealedMessages, setRevealedMessages] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const displayedMessages = showAll ? messages : messages.slice(0, maxDisplay);
  const hasMore = messages.length > maxDisplay;

  const toggleRevealed = (messageId: string) => {
    setRevealedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 10) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    if (score >= 0) return 'text-pink-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-pink-200">Recent Signs ({messages.length})</h4>
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-pink-300 hover:text-pink-200 transition-colors"
          >
            {showAll ? 'Show Less' : `Show All (${messages.length})`}
          </button>
        )}
      </div>

      {displayedMessages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-pink-200/70">No signs yet. Be the first to leave a message!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMessages.map((message) => {
            const isRevealed = revealedMessages.has(message.id);

            return (
              <button
                key={message.id}
                onClick={() => toggleRevealed(message.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleRevealed(message.id);
                  }
                }}
                className={`glass-panel rounded-xl p-6 text-left transition-all duration-300 ${
                  isRevealed
                    ? 'bg-pink-500/10 border-pink-400/30 hover:bg-pink-500/15'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105'
                }`}
                aria-label={isRevealed ? 'Hide soapstone message' : 'Reveal soapstone message'}
              >
                {!isRevealed ? (
                  // Stone marker (collapsed state)
                  <div className="text-center py-8">
                    <div className="text-6xl mb-3 opacity-60" aria-hidden="true">Scroll</div>
                    <p className="text-pink-200/70 text-sm font-medium">Tap to reveal</p>
                    <div className="flex items-center justify-center space-x-2 mt-3">
                      <span className={`text-xs font-semibold ${getScoreColor(message.score)}`}>
                        {message.score > 0 ? '+' : ''}
                        {message.score}
                      </span>
                      <span className="text-xs text-pink-200/50">praise</span>
                    </div>
                  </div>
                ) : (
                  // Revealed message
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {message.user?.avatar ? (
                          <img
                            src={message.user.avatar}
                            alt={message.user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                            <span className="text-pink-300 text-sm font-semibold">
                              {message.user?.name?.[0] || '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-pink-200">
                            {message.user?.name || 'Anonymous Traveler'}
                          </p>
                          <p className="text-xs text-pink-200/50">
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${getScoreColor(message.score)}`}>
                          {message.score > 0 ? '+' : ''}
                          {message.score}
                        </span>
                        <span className="text-xs text-pink-200/50">praise</span>
                      </div>
                    </div>

                    <p className="text-pink-200/90 leading-relaxed">{message.text}</p>

                    <p className="text-xs text-pink-200/50 text-center mt-2">Tap to hide</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {hasMore && !showAll && (
        <div className="text-center pt-4">
          <button onClick={() => setShowAll(true)} className="btn-secondary text-sm">
            Load More Signs
          </button>
        </div>
      )}
    </div>
  );
}

