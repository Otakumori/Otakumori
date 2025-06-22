'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useCommunityAchievements = useCommunityAchievements;
const AchievementContext_1 = require('../contexts/AchievementContext');
function useCommunityAchievements() {
  const { checkAchievement } = (0, AchievementContext_1.useAchievements)();
  // Track structured comments
  const trackStructuredComment = () => {
    checkAchievement('structured_comments', 1);
  };
  // Track total comments
  const trackTotalComments = count => {
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
  const trackCommentLength = length => {
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
