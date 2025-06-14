import { useEffect, useState } from 'react';
import { monitor } from '@/lib/monitor';

interface GameSession {
  startTime: number;
  endTime?: number;
  errors: number;
}

export function GameMonitor() {
  const [activeSessions, setActiveSessions] = useState<Map<string, GameSession>>(new Map());
  const [totalErrors, setTotalErrors] = useState(0);

  useEffect(() => {
    const collectGameMetrics = async () => {
      const now = Date.now();
      let totalSessionTime = 0;
      let activeGames = 0;

      // Calculate metrics from active sessions
      activeSessions.forEach((session, gameId) => {
        if (!session.endTime) {
          activeGames++;
          totalSessionTime += now - session.startTime;
        }
      });

      // Record game metrics
      await monitor.recordGameMetrics({
        activeGames,
        averageSessionTime: activeGames > 0 ? totalSessionTime / activeGames : 0,
        concurrentPlayers: activeGames,
        gameErrors: totalErrors,
      });
    };

    // Set up periodic collection
    const interval = setInterval(collectGameMetrics, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [activeSessions, totalErrors]);

  const startGameSession = (gameId: string) => {
    setActiveSessions(prev => new Map(prev).set(gameId, {
      startTime: Date.now(),
      errors: 0,
    }));
  };

  const endGameSession = (gameId: string) => {
    setActiveSessions(prev => {
      const newSessions = new Map(prev);
      const session = newSessions.get(gameId);
      if (session) {
        newSessions.set(gameId, {
          ...session,
          endTime: Date.now(),
        });
      }
      return newSessions;
    });
  };

  const recordGameError = (gameId: string) => {
    setTotalErrors(prev => prev + 1);
    setActiveSessions(prev => {
      const newSessions = new Map(prev);
      const session = newSessions.get(gameId);
      if (session) {
        newSessions.set(gameId, {
          ...session,
          errors: session.errors + 1,
        });
      }
      return newSessions;
    });
  };

  return {
    startGameSession,
    endGameSession,
    recordGameError,
  };
} 