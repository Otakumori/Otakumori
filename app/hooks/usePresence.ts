'use client';

import { logger } from '@/app/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { type PresenceUpdate, type PresenceResponse } from '@/app/lib/contracts';

export function usePresence() {
  const { user } = useUser();
  const [presence, setPresence] = useState<PresenceResponse | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  // Heartbeat function
  const sendHeartbeat = useCallback(
    async (status: string = 'online', activity?: any) => {
      if (!user) return;

      try {
        const response = await fetch('/api/v1/presence/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            activity,
            showActivity: true,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.ok) {
            setPresence(result.data);
          }
        }
      } catch (error) {
        logger.error('Presence heartbeat error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    },
    [user],
  );

  // Update presence
  const updatePresence = useCallback(
    async (update: PresenceUpdate) => {
      if (!user) return;

      try {
        const response = await fetch('/api/v1/presence/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.ok) {
            setPresence(result.data);
          }
        }
      } catch (error) {
        logger.error('Presence update error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    },
    [user],
  );

  // Set activity
  const setActivity = useCallback(
    (page?: string, game?: string, details?: string) => {
      updatePresence({
        status: 'online',
        activity: { page, game, details },
        showActivity: true,
      });
    },
    [updatePresence],
  );

  // Set status
  const setStatus = useCallback(
    (status: 'online' | 'idle' | 'dnd' | 'offline') => {
      updatePresence({ status });
    },
    [updatePresence],
  );

  // Initialize presence and start heartbeat
  useEffect(() => {
    if (!user) return;

    // Initial heartbeat
    sendHeartbeat('online');

    // Set up heartbeat interval (every 30 seconds)
    const heartbeatInterval = setInterval(() => {
      if (isOnline) {
        sendHeartbeat('online');
      }
    }, 30000);

    // Set up visibility change handlers
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setStatus('idle');
        setIsOnline(false);
      } else {
        setStatus('online');
        setIsOnline(true);
        sendHeartbeat('online');
      }
    };

    const handleBeforeUnload = () => {
      setStatus('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    setIsOnline(true);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setStatus('offline');
    };
  }, [user, sendHeartbeat, setStatus, isOnline]);

  return {
    presence,
    isOnline,
    updatePresence,
    setActivity,
    setStatus,
    sendHeartbeat,
  };
}
