 
 
import { prisma } from '../../../lib/prisma';

export async function getChatMessages(limit = 50) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { isActive: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
}

export async function sendChatMessage(userId, content) {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        authorId: userId,
        content,
        isActive: true,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return message;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

export function subscribeToChatMessages(callback) {
  // TODO: Implement with WebSocket or Server-Sent Events
  // For now, return a no-op unsubscribe function
  console.log('Chat subscription needs WebSocket implementation');
  return () => {}; // Return unsubscribe function
}

export async function deleteChatMessage(messageId, userId) {
  try {
    // First check if the user is the author of the message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { authorId: true },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.authorId !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isActive: false },
    });

    return true;
  } catch (error) {
    console.error('Error deleting chat message:', error);
    throw error;
  }
}

// Report a chat message
export async function reportChatMessage(messageId, userId, reason) {
  try {
    await prisma.contentReport.create({
      data: {
        reporterId: userId,
        contentType: 'chat_message',
        contentId: messageId,
        reason,
        status: 'pending',
      },
    });

    return true;
  } catch (error) {
    console.error('Error reporting chat message:', error);
    throw error;
  }
}

// Admin moderation function
export async function moderateChatMessage(messageId, action, moderatorId) {
  try {
    // Check if moderator is admin
    const moderator = await prisma.user.findUnique({
      where: { id: moderatorId },
      select: { isAdmin: true },
    });

    if (!moderator?.isAdmin) {
      throw new Error('Unauthorized: Only admins can moderate messages');
    }

    switch (action) {
      case 'delete':
        await prisma.chatMessage.update({
          where: { id: messageId },
          data: { isActive: false },
        });
        break;

      case 'warn':
        // Get the message author
        const message = await prisma.chatMessage.findUnique({
          where: { id: messageId },
          select: { authorId: true },
        });

        if (message) {
          await prisma.userWarning.create({
            data: {
              userId: message.authorId,
              moderatorId: moderatorId,
              reason: 'Inappropriate chat message',
              severity: 'low',
            },
          });
        }
        break;

      case 'ban':
        // Get the message author
        const banMessage = await prisma.chatMessage.findUnique({
          where: { id: messageId },
          select: { authorId: true },
        });

        if (banMessage) {
          await prisma.userBan.create({
            data: {
              userId: banMessage.authorId,
              moderatorId: moderatorId,
              reason: 'Severe chat violation',
              duration: '7 days',
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            },
          });
        }
        break;

      default:
        throw new Error('Invalid moderation action');
    }

    return true;
  } catch (error) {
    console.error('Error moderating chat message:', error);
    throw error;
  }
}

// Get user warnings (admin only)
export async function getUserWarnings(userId, requesterId) {
  try {
    // Check if requester is admin
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { isAdmin: true },
    });

    if (!requester?.isAdmin) {
      throw new Error('Unauthorized: Only admins can view user warnings');
    }

    const warnings = await prisma.userWarning.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        moderator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return warnings;
  } catch (error) {
    console.error('Error fetching user warnings:', error);
    throw error;
  }
}

// Get user ban status
export async function getUserBanStatus(userId) {
  try {
    const activeBan = await prisma.userBan.findFirst({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        moderator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return activeBan;
  } catch (error) {
    console.error('Error fetching user ban status:', error);
    throw error;
  }
}

// Get active reports (admin only)
export async function getActiveReports(requesterId) {
  try {
    // Check if requester is admin
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { isAdmin: true },
    });

    if (!requester?.isAdmin) {
      throw new Error('Unauthorized: Only admins can view reports');
    }

    const reports = await prisma.contentReport.findMany({
      where: { status: 'pending' },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports;
  } catch (error) {
    console.error('Error fetching active reports:', error);
    throw error;
  }
}
