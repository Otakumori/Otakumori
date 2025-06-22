'use strict';
'use client';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AvatarCustomizer = void 0;
const react_1 = require('react');
const react_easy_crop_1 = __importDefault(require('react-easy-crop'));
const framer_motion_1 = require('framer-motion');
const useSound_1 = require('@/lib/hooks/useSound');
const useHaptic_1 = require('@/lib/hooks/useHaptic');
const AvatarCustomizer = ({ imageSrc, onComplete, onClose }) => {
  // Crop & transform
  const [crop, setCrop] = (0, react_1.useState)({ x: 0.5, y: 0.5 });
  const [zoom, setZoom] = (0, react_1.useState)(1);
  const [rotation, setRotation] = (0, react_1.useState)(0);
  // Morph sliders
  const [boobSize, setBoobSize] = (0, react_1.useState)(50);
  const [dickSize, setDickSize] = (0, react_1.useState)(50);
  const [height, setHeight] = (0, react_1.useState)(50);
  const [weight, setWeight] = (0, react_1.useState)(50);
  const [muscle, setMuscle] = (0, react_1.useState)(50);
  const [hips, setHips] = (0, react_1.useState)(50);
  const [waist, setWaist] = (0, react_1.useState)(50);
  // Filter sliders
  const [brightness, setBrightness] = (0, react_1.useState)(100);
  const [contrast, setContrast] = (0, react_1.useState)(100);
  const [saturation, setSaturation] = (0, react_1.useState)(100);
  const [hue, setHue] = (0, react_1.useState)(0);
  const [blur, setBlur] = (0, react_1.useState)(0);
  const [sharpness, setSharpness] = (0, react_1.useState)(0);
  // Color adjustments
  const [skinTone, setSkinTone] = (0, react_1.useState)(0);
  const [hairColor, setHairColor] = (0, react_1.useState)(0);
  const [eyeColor, setEyeColor] = (0, react_1.useState)(0);
  const { playSound } = (0, useSound_1.useSound)();
  const { vibrate } = (0, useHaptic_1.useHaptic)();
  const handleSliderChange = (setter, value) => {
    setter(value);
    playSound('click');
    vibrate('light');
  };
  const onCropComplete = (0, react_1.useCallback)(
    (area, areaPixels) => {
      onComplete({
        areaPixels,
        rotation,
        morph: {
          boobSize,
          dickSize,
          height,
          weight,
          muscle,
          hips,
          waist,
        },
        filters: {
          brightness,
          contrast,
          saturation,
          hue,
          blur,
          sharpness,
        },
        colors: {
          skinTone,
          hairColor,
          eyeColor,
        },
      });
    },
    [
      onComplete,
      rotation,
      boobSize,
      dickSize,
      height,
      weight,
      muscle,
      hips,
      waist,
      brightness,
      contrast,
      saturation,
      hue,
      blur,
      sharpness,
      skinTone,
      hairColor,
      eyeColor,
    ]
  );
  return (
    <framer_motion_1.motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <framer_motion_1.motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="mx-4 w-full max-w-4xl rounded-2xl bg-gray-900 p-6 shadow-lg"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-pink-400">Forge Your Legend</h2>
          <button onClick={onClose} className="text-white/70 transition-colors hover:text-white">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Preview Area */}
          <div
            className="relative aspect-square w-full overflow-hidden rounded-lg bg-black"
            style={{
              filter: `
                brightness(${brightness}%)
                contrast(${contrast}%)
                saturate(${saturation}%)
                hue-rotate(${hue}deg)
                blur(${blur}px)
              `,
            }}
          >
            <react_easy_crop_1.default
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              cropShape="round"
              showGrid={false}
            />
          </div>

          {/* Controls */}
          <div className="max-h-[600px] space-y-6 overflow-y-auto pr-4">
            {/* Basic Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold text-pink-400">Basic Controls</h3>
              <Slider
                label="Position X"
                value={crop.x * 100}
                onChange={v => setCrop({ x: v / 100, y: crop.y })}
                min={0}
                max={100}
              />
              <Slider
                label="Position Y"
                value={crop.y * 100}
                onChange={v => setCrop({ x: crop.x, y: v / 100 })}
                min={0}
                max={100}
              />
              <Slider
                label="Zoom"
                value={zoom * 100}
                onChange={v => setZoom(v / 100)}
                min={100}
                max={300}
              />
              <Slider label="Rotation" value={rotation} onChange={setRotation} min={0} max={360} />
            </div>

            {/* Morph Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold text-pink-400">Body Morph</h3>
              <Slider
                label="Height"
                value={height}
                onChange={v => handleSliderChange(setHeight, v)}
                min={0}
                max={100}
              />
              <Slider
                label="Weight"
                value={weight}
                onChange={v => handleSliderChange(setWeight, v)}
                min={0}
                max={100}
              />
              <Slider
                label="Muscle"
                value={muscle}
                onChange={v => handleSliderChange(setMuscle, v)}
                min={0}
                max={100}
              />
              <Slider
                label="Hips"
                value={hips}
                onChange={v => handleSliderChange(setHips, v)}
                min={0}
                max={100}
              />
              <Slider
                label="Waist"
                value={waist}
                onChange={v => handleSliderChange(setWaist, v)}
                min={0}
                max={100}
              />
              <Slider
                label="Boob Size"
                value={boobSize}
                onChange={v => handleSliderChange(setBoobSize, v)}
                min={0}
                max={100}
              />
              <Slider
                label="Dick Size"
                value={dickSize}
                onChange={v => handleSliderChange(setDickSize, v)}
                min={0}
                max={100}
              />
            </div>

            {/* Filter Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold text-pink-400">Image Filters</h3>
              <Slider
                label="Brightness"
                value={brightness}
                onChange={v => handleSliderChange(setBrightness, v)}
                min={50}
                max={150}
              />
              <Slider
                label="Contrast"
                value={contrast}
                onChange={v => handleSliderChange(setContrast, v)}
                min={50}
                max={150}
              />
              <Slider
                label="Saturation"
                value={saturation}
                onChange={v => handleSliderChange(setSaturation, v)}
                min={0}
                max={200}
              />
              <Slider
                label="Hue"
                value={hue}
                onChange={v => handleSliderChange(setHue, v)}
                min={0}
                max={360}
              />
              <Slider
                label="Blur"
                value={blur}
                onChange={v => handleSliderChange(setBlur, v)}
                min={0}
                max={10}
                step={0.5}
              />
              <Slider
                label="Sharpness"
                value={sharpness}
                onChange={v => handleSliderChange(setSharpness, v)}
                min={-100}
                max={100}
              />
            </div>

            {/* Color Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold text-pink-400">Colors</h3>
              <Slider
                label="Skin Tone"
                value={skinTone}
                onChange={v => handleSliderChange(setSkinTone, v)}
                min={0}
                max={360}
              />
              <Slider
                label="Hair Color"
                value={hairColor}
                onChange={v => handleSliderChange(setHairColor, v)}
                min={0}
                max={360}
              />
              <Slider
                label="Eye Color"
                value={eyeColor}
                onChange={v => handleSliderChange(setEyeColor, v)}
                min={0}
                max={360}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 px-6 py-3 text-white transition-colors hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={() => onCropComplete(null, null)}
            className="rounded-lg bg-pink-500 px-6 py-3 text-white transition-colors hover:bg-pink-600"
          >
            Seal Your Fate
          </button>
        </div>
      </framer_motion_1.motion.div>
    </framer_motion_1.motion.div>
  );
};
exports.AvatarCustomizer = AvatarCustomizer;
const Slider = ({ label, value, onChange, min, max, step = 1 }) => (
  <div>
    <label className="mb-1 block text-white/70">
      {label}: {value.toFixed(step < 1 ? 1 : 0)}
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="thumb:h-4 thumb:w-4 thumb:bg-pink-500 thumb:rounded-full h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
    />
  </div>
);
