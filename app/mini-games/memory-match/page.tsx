/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import GameShell from "../_shared/GameShell";
import Scene from "./Scene";

export const metadata = { title: "Memory Match" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <GameShell gameKey="memory-match" title="Memory Match">
        <Scene />
      </GameShell>
    </div>
  );
}
