'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.broadcastFriendActivity =
  exports.updateEchoStats =
  exports.broadcastAchievement =
  exports.sendNotification =
  exports.initSocket =
    void 0;
const socket_io_1 = require('socket.io');
const prisma_1 = require('./prisma');
const initSocket = (req, res) => {
  if (!res.socket.server.io) {
    const io = new socket_io_1.Server(res.socket.server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });
    io.on('connection', socket => {
      console.log('Client connected:', socket.id);
      // Join user's personal room
      socket.on('join_room', async room => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
      });
      // Leave room
      socket.on('leave_room', room => {
        socket.leave(room);
        console.log(`User left room: ${room}`);
      });
      // Handle echo likes
      socket.on('like_echo', async echoId => {
        try {
          // Update database
          const echo = await prisma_1.prisma.echo.update({
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
      socket.on('friend_request', async targetUserId => {
        try {
          const userId = socket.data.userId;
          if (!userId) return;
          // Create friend request
          await prisma_1.prisma.friendship.create({
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
      socket.on('send_message', async data => {
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
      socket.on('typing', data => {
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
exports.initSocket = initSocket;
// Utility functions for server-side events
const sendNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', notification);
};
exports.sendNotification = sendNotification;
const broadcastAchievement = (io, userId, achievement) => {
  io.to(`user_${userId}`).emit('achievement_unlock', achievement);
};
exports.broadcastAchievement = broadcastAchievement;
const updateEchoStats = (io, echoId, stats) => {
  io.to(`echo_${echoId}`).emit('echo_update', {
    echoId,
    ...stats,
  });
};
exports.updateEchoStats = updateEchoStats;
const broadcastFriendActivity = (io, userId, activity) => {
  // Get user's friends and broadcast to them
  prisma_1.prisma.friendship
    .findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
    })
    .then(friendships => {
      const friendIds = friendships.map(f => (f.userId === userId ? f.friendId : f.userId));
      friendIds.forEach(friendId => {
        io.to(`user_${friendId}`).emit('friend_activity', {
          userId,
          activity,
          timestamp: new Date(),
        });
      });
    });
};
exports.broadcastFriendActivity = broadcastFriendActivity;
