/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import GameShell from "../_shared/GameShell";
import Scene from "./Scene";

export const metadata = { title: "Bubble Ragdoll" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <GameShell gameKey="bubble-ragdoll" title="Bubble Ragdoll">
        <Scene />
      </GameShell>
    </div>
  );
}
