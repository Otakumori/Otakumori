import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useCommunityAchievements() {
  const { unlock } = useAchievements();

  // Track structured comments
  const trackStructuredComment = () => {
    unlock('structured_comments');
  };

  // Track total comments
  const trackTotalComments = (count: number) => {
    unlock('total_comments');
  };

  // Track first comment
  const trackFirstComment = () => {
    unlock('first_comment');
  };

  // Track comment reactions
  const trackCommentReaction = () => {
    unlock('comment_reactions');
  };

  // Track comment replies
  const trackCommentReply = () => {
    unlock('comment_replies');
  };

  // Track comment length
  const trackCommentLength = (length: number) => {
    if (length >= 1000) {
      unlock('long_comments');
    }
  };

  return {
    trackStructuredComment,
    trackTotalComments,
    trackFirstComment,
    trackCommentReaction,
    trackCommentReply,
    trackCommentLength,
  };
}
