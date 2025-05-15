'use client';

import { createContext, useContext, useState } from 'react';
import DarkSoulsMessage from '../components/DarkSoulsMessage';

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const showMessage = (message, duration = 5000) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, message, duration }]);
  };

  const removeMessage = (id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      {messages.map(({ id, message, duration }) => (
        <DarkSoulsMessage
          key={id}
          message={message}
          duration={duration}
          onComplete={() => removeMessage(id)}
        />
      ))}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
} 