// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import dynamic from 'next/dynamic';
import { WorldProvider } from '@/app/world/WorldProvider';

// Dynamically import R3F components to prevent SSR issues
const TreeStage = dynamic(() => import('@/app/components/tree/TreeStage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      {
        <>
          <span role="img" aria-label="emoji">
            L
          </span>
          <span role="img" aria-label="emoji">
            o
          </span>
          <span role="img" aria-label="emoji">
            a
          </span>
          <span role="img" aria-label="emoji">
            d
          </span>
          <span role="img" aria-label="emoji">
            i
          </span>
          <span role="img" aria-label="emoji">
            n
          </span>
          <span role="img" aria-label="emoji">
            g
          </span>
          ' '
          <span role="img" aria-label="emoji">
            3
          </span>
          <span role="img" aria-label="emoji">
            D
          </span>
          ' '
          <span role="img" aria-label="emoji">
            W
          </span>
          <span role="img" aria-label="emoji">
            o
          </span>
          <span role="img" aria-label="emoji">
            r
          </span>
          <span role="img" aria-label="emoji">
            l
          </span>
          <span role="img" aria-label="emoji">
            d
          </span>
          ...
        </>
      }
    </div>
  ),
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
