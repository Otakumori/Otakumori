'use client';

import { useMemo } from 'react';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { NSFW_MORPH_TARGETS } from '@/app/lib/3d/avatar-parts';
import { CustomizationPanel } from '../CustomizationPanel';
import { SliderControl } from '../SliderControl';

interface MorphingTabProps {
  configuration: AvatarConfiguration;
  updateMorphTarget: (targetName: string, value: number) => void;
  showNsfwContent: boolean;
  ageVerified: boolean;
}

export function MorphingTab({
  configuration,
  updateMorphTarget,
  showNsfwContent,
  ageVerified,
}: MorphingTabProps) {
  const visibleMorphTargets = useMemo(() => {
    return Object.entries(NSFW_MORPH_TARGETS).filter(([_, morphTarget]) => {
      if (!morphTarget.adultContent) return true;
      return showNsfwContent && ageVerified;
    });
  }, [showNsfwContent, ageVerified]);

  return (
    <div
      id="panel-morphing"
      role="tabpanel"
      aria-labelledby="tab-morphing"
      className="space-y-4"
    >
      {visibleMorphTargets.map(([targetName, morphTarget]) => (
        <CustomizationPanel key={targetName} title={morphTarget.name} collapsible>
          <SliderControl
            label={morphTarget.name}
            value={configuration.morphTargets[targetName] ?? morphTarget.defaultValue}
            min={morphTarget.min}
            max={morphTarget.max}
            step={0.01}
            onChange={(value) => updateMorphTarget(targetName, value)}
            format={(value) => `${(value * 100).toFixed(0)}%`}
          />
        </CustomizationPanel>
      ))}
    </div>
  );
}

