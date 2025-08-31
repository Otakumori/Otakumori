'use client';

import { WorldProvider, useWorld } from '@/app/world/WorldProvider';
import TreeStage from '@/app/components/tree/TreeStage';
import Avatar from '@/app/components/avatar/Avatar';
// import { SettingsPanel } from "@/app/components/debug/SettingsPanel"; // To be created

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
