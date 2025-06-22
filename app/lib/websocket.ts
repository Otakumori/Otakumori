import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { prisma } from './prisma';

export interface ServerToClientEvents {
  notification: (data: {
    type: 'achievement' | 'message' | 'friend_request' | 'system';
    title: string;
    message?: string;
    data?: any;
  }) => void;
  echo_update: (data: { echoId: string; likes: number; shares: number }) => void;
  friend_activity: (data: { userId: string; activity: string; timestamp: Date }) => void;
  chat_message: (data: { from: string; message: string; timestamp: Date }) => void;
  achievement_unlock: (data: { achievementId: string; name: string; iconUrl: string }) => void;
}

export interface ClientToServerEvents {
  join_room: (room: string) => void;
  leave_room: (room: string) => void;
  send_message: (data: { room: string; message: string }) => void;
  like_echo: (echoId: string) => void;
  friend_request: (targetUserId: string) => void;
  typing: (data: { room: string; isTyping: boolean }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  username?: string;
}

export type NextApiResponseServerIO = NextApiRequest & {
  socket: {
    server: NetServer & {
      io: ServerIO<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
    };
  };
};

export const initSocket = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const io = new ServerIO<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(res.socket.server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket: any) => {
      console.log('Client connected:', socket.id);

      // Join user's personal room
      socket.on('join_room', async (room: string) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
      });

      // Leave room
      socket.on('leave_room', (room: string) => {
        socket.leave(room);
        console.log(`User left room: ${room}`);
      });

      // Handle echo likes
      socket.on('like_echo', async (echoId: string) => {
        try {
          // Update database
          const echo = await prisma.echo.update({
            where: { id: echoId },
            data: { likes: { increment: 1 } },
          });

          // Broadcast to all users viewing this echo
          io.to(`echo_${echoId}`).emit('echo_update', {
            echoId,
            likes: echo.likes,
            shares: echo.shares,
          });
        } catch (error) {
          console.error('Error updating echo like:', error);
        }
      });

      // Handle friend requests
      socket.on('friend_request', async (targetUserId: string) => {
        try {
          const userId = socket.data.userId;
          if (!userId) return;

          // Create friend request
          await prisma.friendship.create({
            data: {
              userId,
              friendId: targetUserId,
              status: 'PENDING',
            },
          });

          // Send notification to target user
          io.to(`user_${targetUserId}`).emit('notification', {
            type: 'friend_request',
            title: 'New Friend Request',
            message: `${socket.data.username} sent you a friend request`,
            data: { fromUserId: userId, fromUsername: socket.data.username },
          });
        } catch (error) {
          console.error('Error sending friend request:', error);
        }
      });

      // Handle chat messages
      socket.on('send_message', async (data: { room: string; message: string }) => {
        try {
          const userId = socket.data.userId;
          if (!userId) return;

          // Save message to database (if you have a chat system)
          // const message = await prisma.chatMessage.create({
          //   data: {
          //     roomId: data.room,
          //     userId,
          //     content: data.message,
          //   },
          // });

          // Broadcast to room
          io.to(data.room).emit('chat_message', {
            from: socket.data.username || 'Anonymous',
            message: data.message,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });

      // Handle typing indicators
      socket.on('typing', (data: { room: string; isTyping: boolean }) => {
        socket.to(data.room).emit('typing', {
          userId: socket.data.userId,
          username: socket.data.username,
          isTyping: data.isTyping,
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
};

// Utility functions for server-side events
export const sendNotification = (
  io: ServerIO,
  userId: string,
  notification: {
    type: 'achievement' | 'message' | 'friend_request' | 'system';
    title: string;
    message?: string;
    data?: any;
  }
) => {
  io.to(`user_${userId}`).emit('notification', notification);
};

export const broadcastAchievement = (
  io: ServerIO,
  userId: string,
  achievement: { id: string; name: string; iconUrl: string }
) => {
  io.to(`user_${userId}`).emit('achievement_unlock', achievement);
};

export const updateEchoStats = (
  io: ServerIO,
  echoId: string,
  stats: { likes: number; shares: number }
) => {
  io.to(`echo_${echoId}`).emit('echo_update', {
    echoId,
    ...stats,
  });
};

export const broadcastFriendActivity = (io: ServerIO, userId: string, activity: string) => {
  // Get user's friends and broadcast to them
  prisma.friendship
    .findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
    })
    .then((friendships: any[]) => {
      const friendIds = friendships.map((f: any) => (f.userId === userId ? f.friendId : f.userId));

      friendIds.forEach(friendId => {
        io.to(`user_${friendId}`).emit('friend_activity', {
          userId,
          activity,
          timestamp: new Date(),
        });
      });
    });
};
