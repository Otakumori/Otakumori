import GameShell from "../_shared/GameShell";
import LeaderboardPanel from "../_shared/LeaderboardPanel";
import Scene from "./Scene";
import { QuickMathWrapper } from "./QuickMathWrapper";

export const metadata = { title: "Quick Math" };

export default function Page(){
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <QuickMathWrapper />
    </div>
  );
}
