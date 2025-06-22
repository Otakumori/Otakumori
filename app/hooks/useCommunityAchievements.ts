import { useEffect } from 'react';
import { useAchievements } from '../contexts/AchievementContext';

export function useCommunityAchievements() {
  const { checkAchievement } = useAchievements();

  // Track structured comments
  const trackStructuredComment = () => {
    checkAchievement('structured_comments', 1);
  };

  // Track total comments
  const trackTotalComments = (count: number) => {
    checkAchievement('total_comments', count);
  };

  // Track first comment
  const trackFirstComment = () => {
    checkAchievement('first_comment', 1);
  };

  // Track comment reactions
  const trackCommentReaction = () => {
    checkAchievement('comment_reactions', 1);
  };

  // Track comment replies
  const trackCommentReply = () => {
    checkAchievement('comment_replies', 1);
  };

  // Track comment length
  const trackCommentLength = (length: number) => {
    if (length >= 1000) {
      checkAchievement('long_comments', 1);
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
