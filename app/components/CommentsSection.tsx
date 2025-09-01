'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import GlassCard from '@/app/components/ui/GlassCard';
import GlassButton from '@/app/components/ui/GlassButton';
import { type Comment, type CommentCreate } from '@/app/lib/contracts';

interface CommentsSectionProps {
  contentType: 'profile' | 'achievement' | 'leaderboard' | 'activity';
  contentId: string;
  className?: string;
}

export default function CommentsSection({
  contentType,
  contentId,
  className = '',
}: CommentsSectionProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadComments();
  }, [contentType, contentId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/comments?contentType=${contentType}&contentId=${contentId}&limit=20`,
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (parentId?: string) => {
    if (!user || !newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const commentData: CommentCreate = {
        content: newComment.trim(),
        contentType,
        contentId,
        parentId,
      };

      const response = await fetch('/api/v1/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [data.data, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/v1/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, isLiked: data.data.liked, likeCount: data.data.likeCount }
              : comment,
          ),
        );
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!user) return;

    const reason = prompt('Report reason (spam, harassment, inappropriate, other):');
    if (!reason) return;

    try {
      const response = await fetch('/api/v1/comments/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, reason }),
      });

      if (response.ok) {
        alert('Comment reported successfully');
      }
    } catch (error) {
      console.error('Failed to report comment:', error);
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  if (isLoading) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="text-center text-gray-400">Loading comments...</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4">Comments</h3>

      {/* Comment Form */}
      {user && (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-400">{newComment.length}/500 characters</span>
            <GlassButton
              onClick={() => handleSubmitComment()}
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </GlassButton>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border-b border-white/10 pb-4 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-sm font-medium">
                  {comment.author?.username?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Comment Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {comment.author?.display_name || comment.author?.username}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-200 mb-2">{comment.content}</p>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1 hover:text-pink-400 transition-colors ${
                        comment.isLiked ? 'text-pink-400' : 'text-gray-400'
                      }`}
                    >
                      <span>{comment.isLiked ? '♥' : '♡'}</span>
                      <span>{comment.likeCount}</span>
                    </button>

                    {comment.replyCount > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {showReplies[comment.id] ? 'Hide' : 'Show'} {comment.replyCount} replies
                      </button>
                    )}

                    {user && (
                      <button
                        onClick={() => handleReportComment(comment.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </GlassCard>
  );
}
