// DEPRECATED: This component is a duplicate. Use app\components\components\SoapstoneMessage.tsx instead.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SoapstoneMessage {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  position: { x: number; y: number };
  isRevealed: boolean;
}

export default function SoapstoneMessage() {
  const [messages, setMessages] = useState<SoapstoneMessage[]>([]);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Simulated message creation (replace with actual API call)
  useEffect(() => {
    const createMessage = () => {
      const newMessage: SoapstoneMessage = {
        id: Date.now().toString(),
        text: 'Praise the sun! ',
        author: 'Solaire',
        createdAt: new Date(),
        position: {
          x: Math.random() * (window.innerWidth - 200),
          y: Math.random() * (window.innerHeight - 100),
        },
        isRevealed: false,
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    // Create a message every 30 seconds (adjust as needed)
    const interval = setInterval(createMessage, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMessageClick = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isRevealed: true } : msg)),
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
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
