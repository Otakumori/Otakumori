'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = SoapstoneMessage;
const react_1 = __importStar(require('react'));
const framer_motion_1 = require('framer-motion');
function SoapstoneMessage() {
  const [messages, setMessages] = (0, react_1.useState)([]);
  const [isPlayingSound, setIsPlayingSound] = (0, react_1.useState)(false);
  // Simulated message creation (replace with actual API call)
  (0, react_1.useEffect)(() => {
    const createMessage = () => {
      const newMessage = {
        id: Date.now().toString(),
        text: 'Praise the sun! 🌸',
        author: 'Solaire',
        createdAt: new Date(),
        position: {
          x: Math.random() * (window.innerWidth - 200),
          y: Math.random() * (window.innerHeight - 100),
        },
        isRevealed: false,
      };
      setMessages(prev => [...prev, newMessage]);
    };
    // Create a message every 30 seconds (adjust as needed)
    const interval = setInterval(createMessage, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleMessageClick = messageId => {
    setMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, isRevealed: true } : msg))
    );
    // Play runic reveal sound
    if (!isPlayingSound) {
      setIsPlayingSound(true);
      const audio = new Audio('/assets/sounds/runic-reveal.mp3');
      audio.volume = 0.3;
      audio.play().finally(() => setIsPlayingSound(false));
    }
  };
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <framer_motion_1.AnimatePresence>
        {messages.map(message => (
          <framer_motion_1.motion.div
            key={message.id}
            className="pointer-events-auto absolute cursor-pointer"
            initial={{ opacity: 0, y: message.position.y + 20 }}
            animate={{ opacity: 1, y: message.position.y }}
            exit={{ opacity: 0 }}
            style={{ left: message.position.x }}
          >
            <div className="group relative" onClick={() => handleMessageClick(message.id)}>
              {/* Runic Background */}
              <div className="absolute inset-0 -rotate-1 transform rounded-lg bg-pink-500/20 blur-md" />

              {/* Message Content */}
              <div className="relative rounded-lg border border-pink-500/30 bg-black/70 p-4 backdrop-blur-sm">
                <p className="font-runic mb-2 text-lg text-white">{message.text}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-pink-400">{message.author}</span>
                  <span className="text-gray-400">{message.createdAt.toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-lg bg-pink-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </framer_motion_1.motion.div>
        ))}
      </framer_motion_1.AnimatePresence>
    </div>
  );
}
