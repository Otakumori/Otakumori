/**
 * Soapstone Enhancement Utilities
 *
 * Utilities for categories, replies, location-based messages, and quests
 */

export type SoapstoneCategory = 'tip' | 'warning' | 'secret' | 'praise' | 'joke' | 'general';

export interface SoapstoneMessageEnhanced {
  id: string;
  text: string;
  authorId: string;
  author?: string;
  appraises: number;
  category?: SoapstoneCategory;
  parentId?: string;
  replies?: SoapstoneMessageEnhanced[];
  location?: {
    x: number;
    y: number;
    page: string;
  };
  createdAt: Date;
}

/**
 * Get category display info
 */
export function getCategoryInfo(category: SoapstoneCategory) {
  const categoryMap: Record<SoapstoneCategory, { label: string; icon: string; color: string }> = {
    tip: { label: 'Tip', icon: '💡', color: 'text-blue-300' },
    warning: { label: 'Warning', icon: '⚠️', color: 'text-amber-300' },
    secret: { label: 'Secret', icon: '🔒', color: 'text-purple-300' },
    praise: { label: 'Praise', icon: '👏', color: 'text-pink-300' },
    joke: { label: 'Joke', icon: '😄', color: 'text-yellow-300' },
    general: { label: 'General', icon: '💬', color: 'text-white/70' },
  };

  return categoryMap[category] || categoryMap.general;
}

/**
 * Build message thread from flat list
 */
export function buildMessageThread(
  messages: SoapstoneMessageEnhanced[],
): SoapstoneMessageEnhanced[] {
  const messageMap = new Map<string, SoapstoneMessageEnhanced>();
  const rootMessages: SoapstoneMessageEnhanced[] = [];

  // Create map of all messages
  messages.forEach((msg) => {
    messageMap.set(msg.id, { ...msg, replies: [] });
  });

  // Build tree structure
  messages.forEach((msg) => {
    const message = messageMap.get(msg.id)!;
    if (msg.parentId) {
      const parent = messageMap.get(msg.parentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(message);
      }
    } else {
      rootMessages.push(message);
    }
  });

  return rootMessages;
}

/**
 * Filter messages by category
 */
export function filterByCategory(
  messages: SoapstoneMessageEnhanced[],
  category: SoapstoneCategory | 'all',
): SoapstoneMessageEnhanced[] {
  if (category === 'all') return messages;
  return messages.filter((msg) => msg.category === category);
}

/**
 * Sort messages by appraisals (most appraised first)
 */
export function sortByAppraisals(messages: SoapstoneMessageEnhanced[]): SoapstoneMessageEnhanced[] {
  return [...messages].sort((a, b) => b.appraises - a.appraises);
}
