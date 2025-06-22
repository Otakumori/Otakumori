import { createClient } from '@supabase/supabase-js';

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function getChatMessages(limit = 50) {
  try {
    const { data: messages, error } = await supabase
      .from('abyss_chat_messages')
      .select(
        `
        *,
        author:author_id (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return messages;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
}

export async function sendChatMessage(userId, content, rating = 'r18') {
  try {
    const { data: message, error } = await supabase
      .from('abyss_chat_messages')
      .insert([
        {
          author_id: userId,
          content,
          rating,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return message;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

export function subscribeToChatMessages(callback) {
  return supabase
    .channel('abyss_chat')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'abyss_chat_messages',
        filter: 'is_active=eq.true',
      },
      async payload => {
        // Fetch the full message with author details
        const { data: message, error } = await supabase
          .from('abyss_chat_messages')
          .select(
            `
            *,
            author:author_id (
              id,
              username,
              avatar_url
            )
          `
          )
          .eq('id', payload.new.id)
          .single();

        if (!error && message) {
          callback(message);
        }
      }
    )
    .subscribe();
}

export async function deleteChatMessage(messageId, userId) {
  try {
    // First check if the user is the author of the message
    const { data: message, error: fetchError } = await supabase
      .from('abyss_chat_messages')
      .select('author_id')
      .eq('id', messageId)
      .single();

    if (fetchError) throw fetchError;

    if (message.author_id !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    const { error } = await supabase
      .from('abyss_chat_messages')
      .update({ is_active: false })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting chat message:', error);
    throw error;
  }
}

export async function reportChatMessage(messageId, userId, reason) {
  try {
    const { error } = await supabase.from('abyss_reports').insert([
      {
        reporter_id: userId,
        content_type: 'chat_message',
        content_id: messageId,
        reason,
        status: 'pending',
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error reporting chat message:', error);
    throw error;
  }
}

// Moderation functions
export async function moderateChatMessage(messageId, action, moderatorId) {
  try {
    switch (action) {
      case 'delete':
        await supabase.from('abyss_chat_messages').update({ is_active: false }).eq('id', messageId);
        break;
      case 'warn':
        // Add warning to user's record
        await supabase.from('abyss_user_warnings').insert([
          {
            user_id: messageId,
            moderator_id: moderatorId,
            reason: 'Inappropriate chat message',
            severity: 'low',
          },
        ]);
        break;
      case 'ban':
        // Ban user from chat
        await supabase.from('abyss_user_bans').insert([
          {
            user_id: messageId,
            moderator_id: moderatorId,
            reason: 'Severe chat violation',
            duration: '7 days',
          },
        ]);
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
