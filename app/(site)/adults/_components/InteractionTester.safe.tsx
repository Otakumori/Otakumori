'use client';

interface InteractionTesterProps {
  config: any;
  onChange: (config: any) => void;
}

export function InteractionTester({ config, onChange }: InteractionTesterProps) {
  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] = { ...current[keys[i]] };
    }

    current[keys[keys.length - 1]] = value;
    onChange(newConfig);
  };

  const interactions = [
    { id: 'idle', name: 'Idle', description: 'Default idle animation' },
    { id: 'wave', name: 'Wave', description: 'Friendly wave gesture' },
    { id: 'bow', name: 'Bow', description: 'Respectful bow gesture' },
    { id: 'dance', name: 'Dance', description: 'Playful dance animation' },
    { id: 'pose', name: 'Pose', description: 'Striking a pose' },
    { id: 'laugh', name: 'Laugh', description: 'Laughing animation' },
    { id: 'blush', name: 'Blush', description: 'Embarrassed blush' },
    { id: 'wink', name: 'Wink', description: 'Playful wink' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold">Interaction Tester</h3>

      {/* Available Interactions */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Available Interactions</h4>

        <div className="grid grid-cols-2 gap-2">
          {interactions.map((interaction) => (
            <button
              key={interaction.id}
              onClick={() => updateConfig('currentInteraction', interaction.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                config.currentInteraction === interaction.id
                  ? 'bg-pink-500/30 border border-pink-400/50'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="text-sm font-medium text-white">{interaction.name}</div>
              <div className="text-xs text-zinc-400 mt-1">{interaction.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interaction Settings */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Interaction Settings</h4>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoPlay"
              checked={config.autoPlay || false}
              onChange={(e) => updateConfig('autoPlay', e.target.checked)}
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
            />
            <label htmlFor="autoPlay" className="text-white text-sm">
              Auto-play interactions
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="loopInteraction"
              checked={config.loopInteraction || false}
              onChange={(e) => updateConfig('loopInteraction', e.target.checked)}
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
            />
            <label htmlFor="loopInteraction" className="text-white text-sm">
              Loop current interaction
            </label>
          </div>
        </div>
      </div>

      {/* Performance Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <div className="text-blue-300 text-sm font-medium">Performance Info</div>
        <div className="text-blue-200 text-xs mt-1">
          Interactions are optimized for smooth performance. Complex animations may impact
          performance on lower-end devices.
        </div>
      </div>
    </div>
  );
}
