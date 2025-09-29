'use client';

import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';

interface AvatarPreviewProps {
  config: any;
  size?: 'small' | 'medium' | 'large';
  showInteractions?: boolean;
  physics?: boolean;
}

export function AvatarPreview({
  config,
  size = 'large',
  showInteractions = true,
  physics = true,
}: AvatarPreviewProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold">Avatar Preview</h3>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div
          className={`relative ${size === 'small' ? 'w-48 h-64' : size === 'medium' ? 'w-64 h-80' : size === 'large' ? 'w-80 h-96' : 'w-96 h-[28rem]'} bg-gradient-to-b from-zinc-900 to-zinc-800 rounded-xl border border-white/20 overflow-hidden`}
        >
          <AvatarRenderer
            config={config}
            mode="3d"
            size={size}
            interactions={showInteractions}
            physics={physics}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Preview Controls */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Preview Controls</h4>

        <div className="flex items-center justify-between">
          <span className="text-white text-sm">Enable Interactions</span>
          <input
            type="checkbox"
            checked={showInteractions}
            readOnly
            className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white text-sm">Enable Physics</span>
          <input
            type="checkbox"
            checked={physics}
            readOnly
            className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
        <div className="text-green-300 text-sm font-medium">Real-time Preview</div>
        <div className="text-green-200 text-xs mt-1">
          Changes are applied instantly. Use the interaction tester to see your avatar in action.
        </div>
      </div>
    </div>
  );
}
