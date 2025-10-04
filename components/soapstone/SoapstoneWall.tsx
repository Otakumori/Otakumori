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
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const displayedMessages = showAll ? messages : messages.slice(0, maxDisplay);
  const hasMore = messages.length > maxDisplay;

  const toggleExpanded = (messageId: string) => {
    setExpandedMessages((prev) => {
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
        <div className="space-y-3">
          {displayedMessages.map((message) => {
            const isExpanded = expandedMessages.has(message.id);
            const shouldTruncate = message.text.length > 100;
            const displayText =
              isExpanded || !shouldTruncate ? message.text : `${message.text.substring(0, 100)}...`;

            return (
              <div
                key={message.id}
                className="glass-panel rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
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
                      <p className="text-xs text-pink-200/50">{formatDate(message.createdAt)}</p>
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

                <div className="ml-11">
                  <p className="text-pink-200/90 leading-relaxed">{displayText}</p>
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpanded(message.id)}
                      className="text-sm text-pink-300 hover:text-pink-200 transition-colors mt-2"
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              </div>
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
