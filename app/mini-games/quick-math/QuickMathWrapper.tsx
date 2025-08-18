"use client";

import { useSearchParams } from "next/navigation";
import GameShell from "../_shared/GameShell";
import LeaderboardPanel from "../_shared/LeaderboardPanel";
import Scene from "./Scene";

export function QuickMathWrapper() {
  const searchParams = useSearchParams();
  const diff = searchParams.get("d");

  return (
    <GameShell 
      gameKey="quick-math" 
      title="Quick Math"
      resultsExtra={<LeaderboardPanel game="quick-math" diff={diff} />}
    >
      <Scene />
    </GameShell>
  );
}
