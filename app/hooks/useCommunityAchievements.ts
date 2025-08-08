import { useEffect } from 'react';
import { useAchievements } from '../components/achievements/AchievementProvider';

export function useCommunityAchievements() {
  const { unlockAchievement } = useAchievements();

  // Track structured comments
  const trackStructuredComment = () => {
    unlockAchievement('structured_comments');
  };

  // Track total comments
  const trackTotalComments = (count: number) => {
    unlockAchievement('total_comments');
  };

  // Track first comment
  const trackFirstComment = () => {
    unlockAchievement('first_comment');
  };

  // Track comment reactions
  const trackCommentReaction = () => {
    unlockAchievement('comment_reactions');
  };

  // Track comment replies
  const trackCommentReply = () => {
    unlockAchievement('comment_replies');
  };

  // Track comment length
  const trackCommentLength = (length: number) => {
    if (length >= 1000) {
      unlockAchievement('long_comments');
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
