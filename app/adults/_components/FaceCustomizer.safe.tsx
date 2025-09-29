'use client';

import { SliderControl } from './SliderControl.safe';

interface FaceCustomizerProps {
  config: any;
  onChange: (config: any) => void;
}

export function FaceCustomizer({ config, onChange }: FaceCustomizerProps) {
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

  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold">Facial Features</h3>

      {/* Face Shape */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Face Shape</h4>

        <SliderControl
          label="Overall Shape"
          value={config.faceShape.overall}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('faceShape.overall', value)}
          description="Round to angular face shape"
        />

        <SliderControl
          label="Jawline"
          value={config.faceShape.jawline}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('faceShape.jawline', value)}
          description="Soft to sharp jawline"
        />

        <SliderControl
          label="Cheekbones"
          value={config.faceShape.cheekbones}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('faceShape.cheekbones', value)}
          description="Flat to prominent cheekbones"
        />

        <SliderControl
          label="Chin Shape"
          value={config.faceShape.chinShape}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('faceShape.chinShape', value)}
          description="Round to pointed chin"
        />
      </div>

      {/* Eyes */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Eyes</h4>

        <SliderControl
          label="Eye Size"
          value={config.eyes.size}
          min={0.7}
          max={1.3}
          step={0.01}
          onChange={(value: number) => updateConfig('eyes.size', value)}
          description="Eye size relative to face"
        />

        <SliderControl
          label="Eye Spacing"
          value={config.eyes.spacing}
          min={0.8}
          max={1.2}
          step={0.01}
          onChange={(value: number) => updateConfig('eyes.spacing', value)}
          description="Distance between eyes"
        />

        <SliderControl
          label="Eye Height"
          value={config.eyes.height}
          min={0.8}
          max={1.2}
          step={0.01}
          onChange={(value: number) => updateConfig('eyes.height', value)}
          description="Eye vertical position"
        />

        <SliderControl
          label="Eye Angle"
          value={config.eyes.angle}
          min={-0.3}
          max={0.3}
          step={0.01}
          onChange={(value: number) => updateConfig('eyes.angle', value)}
          description="Upward to downward eye angle"
        />

        <SliderControl
          label="Eyelid Shape"
          value={config.eyes.eyelidShape}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('eyes.eyelidShape', value)}
          description="Single to double eyelid"
        />

        <div className="space-y-2">
          <label className="block text-white text-sm font-medium">Eye Color</label>
          <input
            type="color"
            value={config.eyes.eyeColor}
            onChange={(e) => updateConfig('eyes.eyeColor', e.target.value)}
            className="w-full h-10 rounded-lg border border-white/20 cursor-pointer"
          />
        </div>

        <SliderControl
          label="Eyebrow Thickness"
          value={config.eyes.eyebrowThickness}
          min={0.5}
          max={1.5}
          step={0.01}
          onChange={(value: number) => updateConfig('eyes.eyebrowThickness', value)}
          description="Thin to thick eyebrows"
        />

        <SliderControl
          label="Eyebrow Angle"
          value={config.eyes.eyebrowAngle}
          min={-0.2}
          max={0.2}
          step={0.01}
          onChange={(value: number) => updateConfig('eyes.eyebrowAngle', value)}
          description="Downward to upward eyebrow angle"
        />
      </div>

      {/* Nose */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Nose</h4>

        <SliderControl
          label="Nose Size"
          value={config.nose.size}
          min={0.7}
          max={1.3}
          step={0.01}
          onChange={(value: number) => updateConfig('nose.size', value)}
          description="Overall nose size"
        />

        <SliderControl
          label="Nose Width"
          value={config.nose.width}
          min={0.7}
          max={1.3}
          step={0.01}
          onChange={(value: number) => updateConfig('nose.width', value)}
          description="Nose bridge width"
        />

        <SliderControl
          label="Nose Height"
          value={config.nose.height}
          min={0.8}
          max={1.2}
          step={0.01}
          onChange={(value: number) => updateConfig('nose.height', value)}
          description="Nose length and height"
        />

        <SliderControl
          label="Bridge Width"
          value={config.nose.bridgeWidth}
          min={0.5}
          max={1.3}
          step={0.01}
          onChange={(value: number) => updateConfig('nose.bridgeWidth', value)}
          description="Nose bridge thickness"
        />

        <SliderControl
          label="Nostril Size"
          value={config.nose.nostrilSize}
          min={0.7}
          max={1.3}
          step={0.01}
          onChange={(value: number) => updateConfig('nose.nostrilSize', value)}
          description="Nostril size and shape"
        />

        <SliderControl
          label="Nose Tip"
          value={config.nose.noseTip}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('nose.noseTip', value)}
          description="Upturned to downturned nose tip"
        />
      </div>

      {/* Mouth */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Mouth</h4>

        <SliderControl
          label="Mouth Size"
          value={config.mouth.size}
          min={0.7}
          max={1.3}
          step={0.01}
          onChange={(value: number) => updateConfig('mouth.size', value)}
          description="Overall mouth size"
        />

        <SliderControl
          label="Mouth Width"
          value={config.mouth.width}
          min={0.8}
          max={1.2}
          step={0.01}
          onChange={(value: number) => updateConfig('mouth.width', value)}
          description="Mouth width relative to face"
        />

        <SliderControl
          label="Lip Thickness"
          value={config.mouth.lipThickness}
          min={0.5}
          max={1.5}
          step={0.01}
          onChange={(value: number) => updateConfig('mouth.lipThickness', value)}
          description="Thin to full lips"
        />

        <SliderControl
          label="Lip Shape"
          value={config.mouth.lipShape}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('mouth.lipShape', value)}
          description="Lip shape definition"
        />

        <SliderControl
          label="Cupid's Bow"
          value={config.mouth.cupidBow}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('mouth.cupidBow', value)}
          description="Flat to defined cupid's bow"
        />

        <SliderControl
          label="Mouth Angle"
          value={config.mouth.mouthAngle}
          min={-0.2}
          max={0.2}
          step={0.01}
          onChange={(value: number) => updateConfig('mouth.mouthAngle', value)}
          description="Downward to upward mouth angle"
        />
      </div>

      {/* Skin and Complexion */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Skin & Complexion</h4>

        <div className="space-y-2">
          <label className="block text-white text-sm font-medium">Skin Tone</label>
          <input
            type="color"
            value={config.skin.tone}
            onChange={(e) => updateConfig('skin.tone', e.target.value)}
            className="w-full h-10 rounded-lg border border-white/20 cursor-pointer"
          />
        </div>

        <SliderControl
          label="Skin Texture"
          value={config.skin.texture}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('skin.texture', value)}
          description="Smooth to rough skin texture"
        />

        <SliderControl
          label="Blemishes"
          value={config.skin.blemishes}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('skin.blemishes', value)}
          description="None to many blemishes"
        />

        <SliderControl
          label="Freckles"
          value={config.skin.freckles}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('skin.freckles', value)}
          description="None to many freckles"
        />

        <SliderControl
          label="Age Spots"
          value={config.skin.ageSpots}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('skin.ageSpots', value)}
          description="None to many age spots"
        />

        <SliderControl
          label="Wrinkles"
          value={config.skin.wrinkles}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(value: number) => updateConfig('skin.wrinkles', value)}
          description="None to many wrinkles"
        />
      </div>
    </div>
  );
}
