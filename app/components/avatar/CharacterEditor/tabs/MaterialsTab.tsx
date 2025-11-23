'use client';

import * as THREE from 'three';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { CustomizationPanel } from '../CustomizationPanel';
import { SliderControl } from '../SliderControl';
import { ColorPicker } from '../ColorPicker';

interface MaterialsTabProps {
  configuration: AvatarConfiguration;
  updateMaterialOverride: (slot: string, override: any) => void;
}

export function MaterialsTab({ configuration, updateMaterialOverride }: MaterialsTabProps) {
  return (
    <div
      id="panel-materials"
      role="tabpanel"
      aria-labelledby="tab-materials"
      className="space-y-4"
    >
      <CustomizationPanel title="Skin Material">
        <ColorPicker
          label="Skin Tone"
          value={new THREE.Color(configuration.materialOverrides?.skin?.value || '#FFDBAC')}
          onChange={(color) =>
            updateMaterialOverride('skin', { type: 'color', value: color })
          }
        />
        <SliderControl
          label="Smoothness"
          value={
            typeof configuration.materialOverrides?.skin_smoothness?.value === 'number'
              ? configuration.materialOverrides.skin_smoothness.value
              : 0.8
          }
          min={0}
          max={1}
          step={0.01}
          onChange={(value) =>
            updateMaterialOverride('skin_smoothness', { type: 'value', value })
          }
        />
      </CustomizationPanel>

      <CustomizationPanel title="Hair Material">
        <ColorPicker
          label="Hair Color"
          value={new THREE.Color(configuration.materialOverrides?.hair?.value || '#8B4513')}
          onChange={(color) =>
            updateMaterialOverride('hair', { type: 'color', value: color })
          }
        />
        <SliderControl
          label="Shine"
          value={
            typeof configuration.materialOverrides?.hair_shine?.value === 'number'
              ? configuration.materialOverrides.hair_shine.value
              : 0.6
          }
          min={0}
          max={1}
          step={0.01}
          onChange={(value) =>
            updateMaterialOverride('hair_shine', { type: 'value', value })
          }
        />
      </CustomizationPanel>

      <CustomizationPanel title="Clothing Material">
        <ColorPicker
          label="Primary Color"
          value={
            new THREE.Color(
              configuration.materialOverrides?.clothing_primary?.value || '#FFFFFF',
            )
          }
          onChange={(color) =>
            updateMaterialOverride('clothing_primary', { type: 'color', value: color })
          }
        />
        <SliderControl
          label="Roughness"
          value={
            typeof configuration.materialOverrides?.clothing_roughness?.value === 'number'
              ? configuration.materialOverrides.clothing_roughness.value
              : 0.5
          }
          min={0}
          max={1}
          step={0.01}
          onChange={(value) =>
            updateMaterialOverride('clothing_roughness', { type: 'value', value })
          }
        />
      </CustomizationPanel>
    </div>
  );
}

