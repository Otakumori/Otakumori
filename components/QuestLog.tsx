/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';
import { useState } from 'react';
import useSWR from 'swr';

type QuestAssignment = {
  id: string;
  progress: number;
  target: number;
  completedAt: string | null;
  claimedAt: string | null;
  bonusEligible: boolean;
  quest: {
    key: string;
    title: string;
    description: string;
    basePetals: number;
    bonusPetals: number;
  };
};

type QuestData = {
  today: QuestAssignment[];
  backlog: QuestAssignment[];
  petalBalance: number;
  currentDay: string;
};

export default function QuestLog() {
  const [claiming, setClaiming] = useState<string | null>(null);

  const { data, mutate } = useSWR<QuestData>('/api/quests/list', (url: string) =>
    fetch(url).then((r) => r.json()),
  );

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-cube-900 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-slate-700 rounded"></div>
            <div className="h-16 bg-slate-700 rounded"></div>
            <div className="h-16 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const { today, backlog, petalBalance, currentDay } = data;

  return (
    <div className="rounded-2xl border border-slate-700 bg-cube-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slatey-200 text-lg font-semibold">Daily Quests</h3>
        <div className="flex items-center gap-2 text-sakura-500">
          <span className="text-sm">🌸</span>
          <span className="font-medium">{petalBalance}</span>
        </div>
      </div>

      <div className="space-y-3">
        {today.map((assignment) => (
          <QuestRow
            key={assignment.id}
            assignment={assignment}
            onClaim={() => mutate()}
            claiming={claiming === assignment.id}
            setClaiming={setClaiming}
          />
        ))}
      </div>

      {backlog.length > 0 && (
        <>
          <div className="mt-6 pt-4 border-t border-slate-700">
            <h4 className="text-slatey-200 mb-3 font-medium">Backlog (base reward only)</h4>
            <div className="space-y-3">
              {backlog.map((assignment) => (
                <QuestRow
                  key={assignment.id}
                  assignment={assignment}
                  onClaim={() => mutate()}
                  claiming={claiming === assignment.id}
                  setClaiming={setClaiming}
                  isBacklog={true}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-4 text-xs text-slatey-400 text-center">
        Daily cap: 120 petals • Streak shards awarded once per day
      </div>
    </div>
  );
}

function QuestRow({
  assignment,
  onClaim,
  claiming,
  setClaiming,
  isBacklog = false,
}: {
  assignment: QuestAssignment;
  onClaim: () => void;
  claiming: boolean;
  setClaiming: (id: string | null) => void;
  isBacklog?: boolean;
}) {
  const progress = Math.round((assignment.progress / assignment.target) * 100);
  const canClaim = assignment.completedAt && !assignment.claimedAt;
  const baseReward = assignment.quest.basePetals;
  const bonusReward = assignment.bonusEligible && !isBacklog ? assignment.quest.bonusPetals : 0;
  const totalReward = baseReward + bonusReward;

  async function handleClaim() {
    if (claiming) return;

    setClaiming(assignment.id);
    try {
      const response = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: assignment.id }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.petalsGranted > 0) {
          // Show success toast or animation
          console.log(`🎉 Earned ${result.petalsGranted} petals!`);
        }
        onClaim();
      } else {
        console.error('Failed to claim quest');
      }
    } catch (error) {
      console.error('Error claiming quest:', error);
    } finally {
      setClaiming(null);
    }
  }

  return (
    <li className="rounded-xl border border-slate-700 bg-cube-900/80 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="text-slatey-200 font-medium flex items-center gap-2">
            {assignment.quest.title}
            {isBacklog && (
              <span className="text-xs bg-slate-700 text-slatey-300 px-2 py-1 rounded">
                Backlog
              </span>
            )}
          </div>
          <div className="text-xs text-slatey-400 mt-1">{assignment.quest.description}</div>
        </div>
        <div className="text-right">
          <div className="text-sakura-500 font-semibold flex items-center gap-1">
            +{totalReward} 🌸
          </div>
          {bonusReward > 0 && <div className="text-xs text-sakura-400">+{bonusReward} bonus</div>}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded bg-cube-900">
        <div
          className="h-2 bg-sakura-500 shadow-glow transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress text and claim button */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-slatey-400">
          {assignment.progress} / {assignment.target}
        </div>

        <button
          disabled={!canClaim || claiming}
          onClick={handleClaim}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${
              canClaim
                ? 'bg-sakura-500/20 border border-sakura-400 text-slatey-200 hover:bg-sakura-500/30 shadow-glow'
                : 'bg-slate-700 text-slatey-400 cursor-not-allowed'
            }
            ${claiming ? 'opacity-50' : ''}
          `}
        >
          {claiming
            ? 'Claiming...'
            : assignment.claimedAt
              ? 'Claimed ✓'
              : canClaim
                ? 'Claim Petals'
                : `${assignment.progress}/${assignment.target}`}
        </button>
      </div>
    </li>
  );
}
