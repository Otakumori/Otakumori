'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getCategoryInfo, type SoapstoneCategory, type SoapstoneMessageEnhanced } from '@/app/lib/soapstone-enhancements';

interface SoapstoneMessageEnhancedProps {
  message: SoapstoneMessageEnhanced;
  onAppraise?: (messageId: string) => void;
  onReply?: (messageId: string, text: string) => void;
  showReplies?: boolean;
}

/**
 * Enhanced soapstone message component with appraise and reply functionality
 */
export function SoapstoneMessageEnhanced({
  message,
  onAppraise,
  onReply,
  showReplies = true,
}: SoapstoneMessageEnhancedProps) {
  const { isSignedIn } = useUser();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [hasAppraised, setHasAppraised] = useState(false);

  const categoryInfo = message.category ? getCategoryInfo(message.category) : null;

  const handleAppraise = async () => {
    if (!isSignedIn || hasAppraised) return;

    try {
      const response = await fetch(`/api/v1/soapstone/${message.id}/appraise`, {
        method: 'POST',
      });

      if (response.ok) {
        setHasAppraised(true);
        onAppraise?.(message.id);
      }
    } catch (error) {
      console.error('Failed to appraise message:', error);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !isSignedIn) return;

    try {
      await onReply?.(message.id, replyText);
      setReplyText('');
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 mb-4">
      {/* Category Badge */}
      {categoryInfo && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">{categoryInfo.icon}</span>
          <span className={`text-xs font-medium ${categoryInfo.color}`}>
            {categoryInfo.label}
          </span>
        </div>
      )}

      {/* Message Text */}
      <p className="text-white mb-3 whitespace-pre-wrap">{message.text}</p>

      {/* Message Meta */}
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-4">
          <span className="text-white/60">{message.author || 'Anonymous'}</span>
          <span className="text-white/40">
            {new Date(message.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Appraise Button */}
        {isSignedIn && (
          <button
            onClick={handleAppraise}
            disabled={hasAppraised}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              hasAppraised
                ? 'bg-pink-500/20 text-pink-300 cursor-not-allowed'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            aria-label={`Appraise message (${message.appraises} appraisals)`}
          >
            <span>▲</span>
            <span>{message.appraises}</span>
          </button>
        )}
      </div>

      {/* Reply Section */}
      {showReplies && isSignedIn && (
        <div className="mt-4 pt-4 border-t border-white/20">
          {!isReplying ? (
            <button
              onClick={() => setIsReplying(true)}
              className="text-sm text-pink-300 hover:text-pink-400 transition-colors"
            >
              Reply
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Reply
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText('');
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Replies */}
      {showReplies && message.replies && message.replies.length > 0 && (
        <div className="mt-4 pl-4 border-l-2 border-pink-500/30 space-y-3">
          {message.replies.map((reply) => (
            <SoapstoneMessageEnhanced
              key={reply.id}
              message={reply}
              onAppraise={onAppraise}
              onReply={onReply}
              showReplies={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

