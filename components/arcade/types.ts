// DEPRECATED: This component is a duplicate. Use app\types.ts instead.

export interface EngineGame {
  id: string;
  label: string;
  durationSec: number;
  component: React.ComponentType<GameProps>;
}

export interface GameProps {
  onComplete: (score: number, petals: number) => void;
  onFail: () => void;
  duration: number;
  paused?: boolean;
  _onFail?: () => void;
  _duration?: number;
}

export interface BlossomwareRunResult {
  score: number;
  successes: number;
  failures: number;
  roundsCompleted: number;
  totalRounds: number;
}

export interface BlossomwareOrchestratorState extends BlossomwareRunResult {
  activeGameId: string | null;
  activeGameLabel: string | null;
  roundIndex: number;
  phase: 'preparing' | 'running' | 'transitioning' | 'completed';
}

export interface ProgressData {
  bestScores: Record<string, number>;
  dailyStreak: number;
  lastPlayDate: string;
  totalPetalsEarned: number;
}

export interface Caption {
  id: string;
  text: string;
  timestamp: number;
}

export interface GameResult {
  score: number;
  petals: number;
  success: boolean;
  caption?: string;
}
