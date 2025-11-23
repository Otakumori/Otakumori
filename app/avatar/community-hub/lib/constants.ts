/**
 * Constants and default values for the procedural avatar creator
 */

export const DEFAULT_CHARACTER_CONFIG = {
  gender: 'female' as const,
  faceId: 1,
  baseBody: 'base_fem',
  hair: {
    style: 'short',
    rootColor: '#FF66CC',
    tipColor: '#FFAAC0',
    gloss: 0.5,
  },
  eyes: {
    irisShape: 1,
    colorLeft: '#4B0082',
    colorRight: '#4B0082',
  },
  outfit: {
    id: 'casual',
    primaryColor: '#1C1C1C',
    secondaryColor: '#444444',
  },
  accessories: [] as Array<{
    id: string;
    pos: [number, number, number];
    rot: [number, number, number];
    scale: number;
  }>,
  physique: {
    height: 0.5,
    width: 0.5,
    bust: 0.5,
    waist: 0.5,
    hips: 0.5,
  },
  skinTone: '#FFDBAC',
};

export const HAIR_STYLES = [
  { id: 'short', name: 'Short', complexity: 'low' },
  { id: 'long', name: 'Long', complexity: 'medium' },
  { id: 'twin-tails', name: 'Twin Tails', complexity: 'medium' },
  { id: 'ponytail', name: 'Ponytail', complexity: 'low' },
  { id: 'bob', name: 'Bob', complexity: 'low' },
  { id: 'messy', name: 'Messy', complexity: 'high' },
] as const;

export const OUTFIT_STYLES = [
  { id: 'casual', name: 'Casual' },
  { id: 'school', name: 'School Uniform' },
  { id: 'dress', name: 'Dress' },
  { id: 'sporty', name: 'Sporty' },
] as const;

export const ACCESSORY_TYPES = [
  { id: 'horn_01', name: 'Horn (Small)' },
  { id: 'horn_02', name: 'Horn (Large)' },
  { id: 'tail_01', name: 'Tail (Short)' },
  { id: 'tail_02', name: 'Tail (Long)' },
  { id: 'goggles', name: 'Goggles' },
  { id: 'mask', name: 'Mask' },
] as const;

export const FACE_PRESETS = [
  { id: 1, name: 'Default' },
  { id: 2, name: 'Cute' },
  { id: 3, name: 'Cool' },
  { id: 4, name: 'Mature' },
] as const;

export const CAMERA_POSITION: [number, number, number] = [0, 1.5, 3];
export const CAMERA_TARGET: [number, number, number] = [0, 1.2, 0];

