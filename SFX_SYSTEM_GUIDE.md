# GameCube SFX System Guide

## 🎵 Audio File Mapping

The SFX system uses the following audio files with specific purposes:

### **Boot Sequence**

- **`boot_whoosh.mp3`** - Plays during the entire boot animation (4.5 seconds)
  - Starts immediately when boot sequence begins
  - Stops when boot completes or is skipped
  - Volume: 0.7

### **Main Menu & Navigation**

- **`gamecube-menu.mp3`** - Background menu music and navigation sounds
  - **Background Music**: Loops continuously in main menu (Volume: 0.3)
  - **Navigation**: Plays when switching between cube faces (Volume: 0.4)
  - Stops when entering a face/panel

### **Character Creation**

- **`samus-jingle.mp3`** - Plays after successful character creation
  - Triggered when character creation completes
  - Volume: 0.8
  - Also used for general "confirm" actions (Volume: 0.5)

### **Pause Menus**

- **`midna-lament.mp3`** - Plays in game pause menus
  - Loops while pause menu is open
  - Volume: 0.6
  - Stops when resuming game

### **Reserved for Later**

- **`jpotter-sound.mp3`** - Available for future use

## 🎮 Implementation Examples

### Boot Sequence

```typescript
// Boot whoosh plays for entire duration
const bootWhoosh = audio.play('boot_whoosh', { gain: 0.7 });
// ... boot animation stages ...
// Stop when complete
if (bootWhoosh) bootWhoosh();
```

### Background Menu Music

```typescript
// Start background music
const stopMusic = audio.play('gamecube_menu', {
  gain: 0.3,
  loop: true,
});
// Stop when navigating away
if (stopMusic) stopMusic();
```

### Character Creation

```typescript
// After character creation completes
gameAudio.playCharacterCreated(); // Plays samus-jingle.mp3
```

### Pause Menu

```typescript
// When pausing
const stopMusic = gameAudio.playPauseMenu(); // Plays midna-lament.mp3
// When resuming
if (stopMusic) stopMusic();
```

### Cube Navigation

```typescript
// When switching faces
audio.play('gamecube_menu', { gain: 0.4 });
```

## 🔧 Usage in Components

### 1. Import the audio utilities

```typescript
import { audio } from '@/app/lib/audio';
import { gameAudio } from '@/app/lib/game-audio';
```

### 2. Preload audio files

```typescript
useEffect(() => {
  const files: [string, string][] = [
    ['boot_whoosh', '/sfx/boot_whoosh.mp3'],
    ['gamecube_menu', '/sfx/gamecube-menu.mp3'],
    ['samus_jingle', '/sfx/samus-jingle.mp3'],
    ['midna_lament', '/sfx/midna-lament.mp3'],
  ];
  audio.preload(files);
}, []);
```

### 3. Play sounds at appropriate times

```typescript
// Navigation sound
audio.play('gamecube_menu', { gain: 0.4 });

// Character creation success
gameAudio.playCharacterCreated();

// Pause menu
const stopMusic = gameAudio.playPauseMenu();
```

## 📁 File Structure

```
public/sfx/
├── boot_whoosh.mp3      # Boot sequence (4.5s duration)
├── gamecube-menu.mp3    # Menu music & navigation
├── samus-jingle.mp3     # Character creation & confirm
├── midna-lament.mp3     # Pause menus
└── jpotter-sound.mp3    # Reserved for later
```

## 🎯 Audio Timing

- **Boot Whoosh**: 4.5 seconds total (matches boot animation)
- **Background Menu**: Loops continuously until navigation
- **Navigation Sounds**: Short clips (0.1-0.3 seconds)
- **Character Creation**: Plays once on completion
- **Pause Menu**: Loops while paused

## 🔄 State Management

The audio system automatically handles:

- Audio context unlocking on first user interaction
- Preloading of all SFX files
- Cleanup of background music when navigating
- Proper volume levels for different contexts

## 🎨 Integration with GameCube UI

The SFX system is fully integrated with:

- Boot sequence component
- 3D GameCube navigation
- Face activation
- Background music management
- Gesture controls (swipe/tap)

All audio is synchronized with the visual animations and user interactions for a cohesive GameCube experience.
