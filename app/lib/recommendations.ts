/**
 * Smart Recommendations System
 *
 * AI-powered personalization based on user behavior
 */

export interface UserBehaviorProfile {
  favoriteGameGenres: string[];
  preferredProductCategories: string[];
  readingInterests: string[];
  petalCollectionPattern: 'casual' | 'dedicated' | 'competitive';
  visitFrequency: 'daily' | 'weekly' | 'monthly';
  totalPetals: number;
  gamesPlayed: string[];
  productsViewed: string[];
  postsRead: string[];
}

export interface Recommendation {
  type: 'product' | 'game' | 'blog';
  id: string;
  title: string;
  reason: string;
  score: number;
}

/**
 * Generate personalized recommendations based on user profile
 */
export function generateRecommendations(
  profile: UserBehaviorProfile,
  availableProducts: any[],
  availableGames: any[],
  availablePosts: any[],
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Product recommendations based on viewed products
  if (profile.productsViewed.length > 0) {
    const viewedCategories = new Set(
      availableProducts.filter((p) => profile.productsViewed.includes(p.id)).map((p) => p.category),
    );

    availableProducts
      .filter((p) => !profile.productsViewed.includes(p.id))
      .filter((p) => viewedCategories.has(p.category))
      .slice(0, 3)
      .forEach((product) => {
        recommendations.push({
          type: 'product',
          id: product.id,
          title: product.title,
          reason: `Similar to products you've viewed`,
          score: 0.8,
        });
      });
  }

  // Game recommendations based on played games
  if (profile.gamesPlayed.length > 0) {
    const playedCategories = new Set(
      availableGames.filter((g) => profile.gamesPlayed.includes(g.id)).map((g) => g.category),
    );

    availableGames
      .filter((g) => !profile.gamesPlayed.includes(g.id))
      .filter((g) => playedCategories.has(g.category))
      .slice(0, 3)
      .forEach((game) => {
        recommendations.push({
          type: 'game',
          id: game.id,
          title: game.title,
          reason: `Similar to games you've played`,
          score: 0.8,
        });
      });
  }

  // Blog recommendations based on read posts
  if (profile.postsRead.length > 0) {
    const readTags = new Set(
      availablePosts.filter((p) => profile.postsRead.includes(p.id)).flatMap((p) => p.tags || []),
    );

    availablePosts
      .filter((p) => !profile.postsRead.includes(p.id))
      .filter((p) => (p.tags || []).some((tag: string) => readTags.has(tag)))
      .slice(0, 3)
      .forEach((post) => {
        recommendations.push({
          type: 'blog',
          id: post.id,
          title: post.title,
          reason: `Similar topics to posts you've read`,
          score: 0.7,
        });
      });
  }

  // Sort by score and return top recommendations
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 6);
}

/**
 * Get achievement suggestions based on progress
 */
export function getAchievementSuggestions(
  profile: UserBehaviorProfile,
  allAchievements: any[],
): Recommendation[] {
  const suggestions: Recommendation[] = [];

  // Check progress toward achievements
  allAchievements.forEach((achievement) => {
    if (achievement.progress !== undefined && achievement.target !== undefined) {
      const progress = achievement.progress / achievement.target;
      if (progress > 0.5 && progress < 1.0) {
        const remaining = achievement.target - achievement.progress;
        suggestions.push({
          type: 'game', // Using game type as placeholder
          id: achievement.id,
          title: achievement.name,
          reason: `You're ${remaining} away from "${achievement.name}"`,
          score: progress,
        });
      }
    }
  });

  return suggestions.sort((a, b) => b.score - a.score).slice(0, 3);
}
