'use client';

import dynamic from 'next/dynamic';
import { WorldProvider } from '@/app/world/WorldProvider';

// Dynamically import R3F components to prevent SSR issues
const TreeStage = dynamic(() => import('@/app/components/tree/TreeStage'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading 3D World...</div>
});

const Avatar = dynamic(() => import('@/app/components/avatar/Avatar'), {
  ssr: false,
});

export default function DebugWorld() {
  return (
    <WorldProvider debug>
      <div className="grid grid-cols-[360px_1fr] h-screen">
        {/* <SettingsPanel /> */}
        <div className="relative">
          <TreeStage />
          <Avatar />
          {/* Wallet HUD + Petal overlay mount here */}
        </div>
      </div>
    </WorldProvider>
  );
}
