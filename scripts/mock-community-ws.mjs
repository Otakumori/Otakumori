#!/usr/bin/env node
// Simple mock WS server for Community Face (dev only)
// URL: ws://localhost:8787/__mock_community_ws

import http from 'node:http';
import { WebSocketServer } from 'ws';

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

function send(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch {}
}

wss.on('connection', (ws) => {
  let interval;
  ws.on('message', (msg) => {
    try {
      const h = JSON.parse(msg.toString());
      if (h.type === 'hello') {
        send(ws, { type: 'hello_ack', connId: 'conn_' + Date.now(), resumeCursor: 'evt_0' });
        // Emit a couple of demo events periodically
        interval = setInterval(() => {
          const now = Date.now();
          const evs = [
            {
              type: 'event',
              channel: 'training',
              eventId: 'evt_training_' + now,
              ts: now,
              payload: { npcId: 'maiden', emoteId: 'persistent_bow' },
            },
            {
              type: 'event',
              channel: 'interact',
              eventId: 'evt_interact_' + now,
              ts: now,
              payload: { requestId: 'req_' + now },
            },
          ];
          evs.forEach((e) => send(ws, e));
        }, 8000);
      }
    } catch {}
  });
  ws.on('close', () => {
    if (interval) clearInterval(interval);
  });
});

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/__mock_community_ws') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

const port = process.env.MOCK_COMMUNITY_WS_PORT ? Number(process.env.MOCK_COMMUNITY_WS_PORT) : 8787;
server.listen(port, () =>
  console.log(`Mock Community WS listening on ws://localhost:${port}/__mock_community_ws`),
);
