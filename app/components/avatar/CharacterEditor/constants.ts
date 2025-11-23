import type { CameraPreset, PosePreset, BackgroundPreset } from './types';

export const CAMERA_PRESETS: CameraPreset[] = [
    { id: 'front', name: 'Front View', position: [0, 1.5, 3], target: [0, 1.5, 0], fov: 50 },
    { id: 'side', name: 'Side View', position: [3, 1.5, 0], target: [0, 1.5, 0], fov: 50 },
    { id: 'back', name: 'Back View', position: [0, 1.5, -3], target: [0, 1.5, 0], fov: 50 },
    { id: 'close-up', name: 'Close-up', position: [0, 1.5, 1.5], target: [0, 1.5, 0], fov: 60 },
    { id: 'full-body', name: 'Full Body', position: [0, 2, 4], target: [0, 1, 0], fov: 45 },
    { id: 'low-angle', name: 'Low Angle', position: [0, 0.5, 2], target: [0, 1.5, 0], fov: 55 },
    { id: 'high-angle', name: 'High Angle', position: [0, 3, 2], target: [0, 1.5, 0], fov: 55 },
    { id: 'intimate', name: 'Intimate', position: [0, 1.2, 1], target: [0, 1.2, 0], fov: 70 },
];

export const POSE_PRESETS: PosePreset[] = [
    // Idle poses
    {
        id: 'idle-1',
        name: 'Casual Idle',
        animation: 'idle',
        description: 'Relaxed standing pose',
        category: 'idle',
    },
    {
        id: 'idle-2',
        name: 'Confident Idle',
        animation: 'idle_2',
        description: 'Confident standing pose',
        category: 'idle',
    },
    {
        id: 'idle-3',
        name: 'Shy Idle',
        animation: 'idle_3',
        description: 'Shy, reserved pose',
        category: 'idle',
    },

    // Action poses
    {
        id: 'walk',
        name: 'Walking',
        animation: 'walk',
        description: 'Walking animation',
        category: 'action',
    },
    {
        id: 'run',
        name: 'Running',
        animation: 'run',
        description: 'Running animation',
        category: 'action',
    },
    {
        id: 'jump',
        name: 'Jumping',
        animation: 'jump',
        description: 'Jumping pose',
        category: 'action',
    },
    {
        id: 'victory',
        name: 'Victory',
        animation: 'victory',
        description: 'Victory celebration',
        category: 'action',
    },

    // Emotes
    {
        id: 'happy',
        name: 'Happy',
        animation: 'happy',
        description: 'Happy expression',
        category: 'emote',
    },
    { id: 'wave', name: 'Waving', animation: 'wave', description: 'Waving hello', category: 'emote' },
    { id: 'bow', name: 'Bowing', animation: 'bow', description: 'Polite bow', category: 'emote' },
    {
        id: 'thumbs-up',
        name: 'Thumbs Up',
        animation: 'thumbs_up',
        description: 'Approval gesture',
        category: 'emote',
    },

    // Dance poses
    {
        id: 'dance-1',
        name: 'Dance 1',
        animation: 'dance_1',
        description: 'Energetic dance',
        category: 'dance',
    },
    {
        id: 'dance-2',
        name: 'Dance 2',
        animation: 'dance_2',
        description: 'Smooth dance',
        category: 'dance',
    },
    {
        id: 'dance-3',
        name: 'Dance 3',
        animation: 'dance_3',
        description: 'Sensual dance',
        category: 'dance',
    },

    // NSFW poses (only shown when appropriate)
    {
        id: 'nsfw-seductive',
        name: 'Seductive',
        animation: 'nsfw_seductive',
        description: 'Seductive pose',
        category: 'nsfw',
    },
    {
        id: 'nsfw-intimate',
        name: 'Intimate',
        animation: 'nsfw_intimate',
        description: 'Intimate pose',
        category: 'nsfw',
    },
];

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
    { id: 'studio-white', name: 'Studio White', type: 'color', value: '#FFFFFF' },
    { id: 'studio-gray', name: 'Studio Gray', type: 'color', value: '#808080' },
    { id: 'studio-black', name: 'Studio Black', type: 'color', value: '#000000' },
    {
        id: 'gradient-purple',
        name: 'Purple Gradient',
        type: 'gradient',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
        id: 'gradient-pink',
        name: 'Pink Gradient',
        type: 'gradient',
        value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
        id: 'gradient-blue',
        name: 'Blue Gradient',
        type: 'gradient',
        value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
        id: 'environment-sunset',
        name: 'Sunset Environment',
        type: 'environment',
        value: 'sunset',
        hdrUrl: '/assets/hdr/sunset.hdr',
    },
    {
        id: 'environment-sky',
        name: 'Sky Environment',
        type: 'environment',
        value: 'sky',
        hdrUrl: '/assets/hdr/sky.hdr',
    },
    { id: 'environment-studio', name: 'Studio Environment', type: 'studio', value: 'studio' },
];

