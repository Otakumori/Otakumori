// TODO: Implement with Prisma database
// This file is temporarily disabled during migration from Supabase to Prisma

export async function getChatMessages(limit = 50) {
  try {
    // TODO: Replace with Prisma query
    // const messages = await prisma.abyssChatMessage.findMany({
    //   where: { isActive: true },
    //   include: { author: true },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit
    // });
    
    console.log('Chat API temporarily disabled - migrating to Prisma');
    return [];
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
}

export async function sendChatMessage(userId, content, rating = 'r18') {
  try {
    // TODO: Replace with Prisma query
    // const message = await prisma.abyssChatMessage.create({
    //   data: {
    //     authorId: userId,
    //     content,
    //     rating,
    //     isActive: true
    //   }
    // });
    
    console.log('Chat API temporarily disabled - migrating to Prisma');
    return null;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

export function subscribeToChatMessages(callback) {
  // TODO: Implement with Prisma + WebSocket or Server-Sent Events
  console.log('Chat subscription temporarily disabled - migrating to Prisma');
  return () => {}; // Return unsubscribe function
}

export async function deleteChatMessage(messageId, userId) {
  try {
    // TODO: Replace with Prisma query
    // const message = await prisma.abyssChatMessage.findUnique({
    //   where: { id: messageId },
    //   select: { authorId: true }
    // });
    // 
    // if (message.authorId !== userId) {
    //   throw new Error('Unauthorized to delete this message');
    // }
    // 
    // await prisma.abyssChatMessage.update({
    //   where: { id: messageId },
    //   data: { isActive: false }
    // });
    
    console.log('Chat API temporarily disabled - migrating to Prisma');
    return true;
  } catch (error) {
    console.error('Error deleting chat message:', error);
    throw error;
  }
}

export async function reportChatMessage(messageId, userId, reason) {
  try {
    // TODO: Replace with Prisma query
    // await prisma.abyssReport.create({
    //   data: {
    //     reporterId: userId,
    //     contentType: 'chat_message',
    //     contentId: messageId,
    //     reason,
    //     status: 'pending'
    //   }
    // });
    
    console.log('Chat API temporarily disabled - migrating to Prisma');
    return true;
  } catch (error) {
    console.error('Error reporting chat message:', error);
    throw error;
  }
}

export async function moderateChatMessage(messageId, action, moderatorId) {
  try {
    // TODO: Replace with Prisma queries
    console.log('Chat API temporarily disabled - migrating to Prisma');
    return true;
  } catch (error) {
    console.error('Error moderating chat message:', error);
    throw error;
  }
}
