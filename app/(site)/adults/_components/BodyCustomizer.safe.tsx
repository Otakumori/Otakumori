'use client';

import { SliderControl } from './SliderControl.safe';

interface BodyCustomizerProps {
  config: any;
  onChange: (config: any) => void;
  gender: 'male' | 'female';
}

export function BodyCustomizer({ config, onChange, gender }: BodyCustomizerProps) {
  const updateConfig = (path: string, value: number) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] = { ...current[keys[i]] };
    }

    current[keys[keys.length - 1]] = value;
    onChange(newConfig);
  };

  return (
    <div className="space-y-6" style={{ minHeight: 'fit-content' }}>
      <h3 className="text-white font-semibold">Body Anatomy</h3>

      {/* Basic Body Properties */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Basic Properties</h4>

        <SliderControl
          label="Height"
          value={config.height}
          min={0.7}
          max={1.3}
          step={0.01}
          onChange={(value: number) => updateConfig('height', value)}
          description="Overall body height"
        />

        <SliderControl
          label="Weight"
          value={config.weight}
          min={0.6}
          max={1.5}
          step={0.01}
          onChange={(value: number) => updateConfig('weight', value)}
          description="Body weight and mass"
        />

        <SliderControl
          label="Muscle Mass"
          value={config.muscleMass}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('muscleMass', value)}
          description="Muscle definition and bulk"
        />

        <SliderControl
          label="Body Fat"
          value={config.bodyFat}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('bodyFat', value)}
          description="Body fat percentage"
        />
      </div>

      {/* Detailed Proportions */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Detailed Proportions</h4>

        <SliderControl
          label="Head Size"
          value={config.proportions.headSize}
          min={0.8}
          max={1.2}
          step={0.01}
          onChange={(value: number) => updateConfig('proportions.headSize', value)}
          description="Head size relative to body"
        />

        <SliderControl
          label="Neck Length"
          value={config.proportions.neckLength}
          min={0.7}
          max={1.3}
          step={0.01}
          onChange={(value: number) => updateConfig('proportions.neckLength', value)}
          description="Neck length and thickness"
        />

        <SliderControl
          label="Shoulder Width"
          value={config.proportions.shoulderWidth}
          min={0.7}
          max={1.4}
          step={0.01}
          onChange={(value: number) => updateConfig('proportions.shoulderWidth', value)}
          description="Shoulder breadth and definition"
        />

        <SliderControl
          label="Chest Size"
          value={config.proportions.chestSize}
          min={0.6}
          max={1.4}
          step={0.01}
          onChange={(value: number) => updateConfig('proportions.chestSize', value)}
          description="Chest breadth and depth"
        />

        <SliderControl
          label="Waist Size"
          value={config.proportions.waistSize}
          min={0.6}
          max={1.3}
          step={0.01}
          onChange={(value: number) => updateConfig('proportions.waistSize', value)}
          description="Waist circumference and definition"
        />

        <SliderControl
          label="Hip Width"
          value={config.proportions.hipWidth}
          min={0.7}
          max={1.4}
          step={0.01}
          onChange={(value: number) => updateConfig('proportions.hipWidth', value)}
          description="Hip breadth and shape"
        />

        <SliderControl
          label="Arm Length"
          value={config.proportions.armLength}
          min={0.8}
          max={1.2}
          step={0.01}
          onChange={(value: number) => updateConfig('proportions.armLength', value)}
          description="Arm length relative to body"
        />

        <SliderControl
          label="Leg Length"
          value={config.proportions.legLength}
          min={0.8}
          max={1.3}
          step={0.01}
          onChange={(value: number) => updateConfig('proportions.legLength', value)}
          description="Leg length relative to body"
        />
      </div>

      {/* Gender-Specific Features */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Gender-Specific Features</h4>

        {gender === 'male' && (
          <>
            <SliderControl
              label="Beard Density"
              value={config.genderFeatures.beardDensity || 0.0}
              min={0.0}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('genderFeatures.beardDensity', value)}
              description="Facial hair density and coverage"
            />

            <SliderControl
              label="Chest Hair"
              value={config.genderFeatures.chestHair || 0.0}
              min={0.0}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('genderFeatures.chestHair', value)}
              description="Chest hair coverage"
            />

            <SliderControl
              label="Jaw Strength"
              value={config.genderFeatures.jawStrength || 1.0}
              min={0.5}
              max={1.3}
              step={0.01}
              onChange={(value: number) => updateConfig('genderFeatures.jawStrength', value)}
              description="Jawline definition and strength"
            />

            <SliderControl
              label="Brow Ridge"
              value={config.genderFeatures.browRidge || 1.0}
              min={0.7}
              max={1.2}
              step={0.01}
              onChange={(value: number) => updateConfig('genderFeatures.browRidge', value)}
              description="Brow ridge prominence"
            />
          </>
        )}

        {gender === 'female' && (
          <>
            <SliderControl
              label="Breast Size"
              value={config.genderFeatures.breastSize || 0.8}
              min={0.0}
              max={1.2}
              step={0.01}
              onChange={(value: number) => updateConfig('genderFeatures.breastSize', value)}
              description="Breast size and shape"
            />

            <SliderControl
              label="Hip Curve"
              value={config.genderFeatures.hipCurve || 1.0}
              min={0.7}
              max={1.3}
              step={0.01}
              onChange={(value: number) => updateConfig('genderFeatures.hipCurve', value)}
              description="Hip curvature and femininity"
            />

            <SliderControl
              label="Waist Definition"
              value={config.genderFeatures.waistDefinition || 1.0}
              min={0.5}
              max={1.2}
              step={0.01}
              onChange={(value: number) => updateConfig('genderFeatures.waistDefinition', value)}
              description="Waist cinching and definition"
            />

            <SliderControl
              label="Thigh Gap"
              value={config.genderFeatures.thighGap || 0.3}
              min={0.0}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('genderFeatures.thighGap', value)}
              description="Space between thighs"
            />
          </>
        )}
      </div>

      {/* Advanced Body Sculpting */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Advanced Sculpting</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <h5 className="text-white text-sm font-medium mb-2">Torso</h5>
            <p className="text-zinc-400 text-xs">
              Adjust chest, waist, and abdominal definition for precise body shaping.
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <h5 className="text-white text-sm font-medium mb-2">Limbs</h5>
            <p className="text-zinc-400 text-xs">
              Fine-tune arm and leg proportions, muscle definition, and joint details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
