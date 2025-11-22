'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  buildMessageThread,
  type SoapstoneMessageEnhanced,
} from '@/app/lib/soapstone-enhancements';
import { SoapstoneMessageEnhanced as SoapstoneMessageComponent } from './SoapstoneMessageEnhanced';

interface LocationBasedMessagesProps {
  messages: SoapstoneMessageEnhanced[];
}

/**
 * Display soapstone messages at specific scroll positions on the page
 */
export function LocationBasedMessages({ messages }: LocationBasedMessagesProps) {
  const pathname = usePathname();
  const [visibleMessages, setVisibleMessages] = useState<SoapstoneMessageEnhanced[]>([]);

  useEffect(() => {
    // Filter messages for current page
    const pageMessages = messages.filter((msg) => msg.location?.page === pathname || !msg.location);

    // Build thread structure
    const threads = buildMessageThread(pageMessages);

    // Set visible messages
    setVisibleMessages(threads);

    // Handle scroll-based visibility
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      const visible = threads.filter((msg) => {
        if (!msg.location) return true;
        const messageY = (msg.location.y / 100) * document.documentElement.scrollHeight;
        return messageY >= scrollY - 200 && messageY <= scrollY + viewportHeight + 200;
      });

      setVisibleMessages(visible);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [messages, pathname]);

  if (visibleMessages.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {visibleMessages.map((message) => {
        if (!message.location) return null;

        const x = (message.location.x / 100) * window.innerWidth;
        const y = (message.location.y / 100) * document.documentElement.scrollHeight;

        return (
          <div
            key={message.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="max-w-xs">
              <SoapstoneMessageComponent message={message} showReplies={false} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
