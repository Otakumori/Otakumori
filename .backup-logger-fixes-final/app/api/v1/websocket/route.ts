import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { type NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { wsManager } from '@/app/lib/websocket-manager';

export const runtime = 'nodejs';

// WebSocket server instance
let wss: WebSocketServer | null = null;

export async function GET(request: NextRequest) {
  // Log WebSocket connection request
  logger.warn('WebSocket server requested from:', request.headers.get('user-agent'));

  if (!wss) {
    // Create WebSocket server
    wss = new WebSocketServer({ port: 8080 });

    wss.on('connection', (ws, req) => {
      // Extract user ID from query params or headers
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId') || 'anonymous';

      // Connect to WebSocket manager
      wsManager.connect(userId, ws);
    });

    // 'WebSocket server started on port 8080'
  }

  return new Response('WebSocket server running', { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const { type, data, userId, roomId } = await request.json();

    if (!type || !data) {
      return Response.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    const message = {
      type,
      data,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    if (roomId) {
      await wsManager.broadcastToRoom(roomId, message);
    } else if (userId) {
      await wsManager.sendToUser(userId, message);
    } else {
      wsManager.broadcast(message);
    }

    return Response.json({ ok: true, data: { message } });
  } catch (error) {
    logger.error('WebSocket API error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
