'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = MessageManager;
const react_1 = __importDefault(require('react'));
const framer_motion_1 = require('framer-motion');
const messages = [
  { id: 1, text: 'Welcome to the admin area, Chosen One.', timestamp: new Date().toLocaleString() },
  { id: 2, text: 'The bonfire awaits your guidance.', timestamp: new Date().toLocaleString() },
  { id: 3, text: 'Prepare for the challenges ahead.', timestamp: new Date().toLocaleString() },
];
function MessageManager() {
  return (
    <div className="rounded-lg border border-pink-900/40 bg-black/80 p-4 shadow-2xl">
      <h2 className="mb-4 text-xl font-bold text-pink-400">Messages</h2>
      <div className="space-y-2">
        {messages.map(message => (
          <framer_motion_1.motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded bg-white/5 p-2"
          >
            <p className="text-white">{message.text}</p>
            <p className="text-xs text-white/50">{message.timestamp}</p>
          </framer_motion_1.motion.div>
        ))}
      </div>
    </div>
  );
}
