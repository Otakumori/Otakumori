# O-Cube Boot Screen Asset Brief

## Project Information

**Project:** Otaku-mori GameCube-style Boot Screen  
**Date:** January 8, 2025  
**Version:** 1.0  
**Author:** Otaku-mori Development Team

**Licensing Note:** All assets are original designs inspired by GameCube aesthetics. No Nintendo proprietary assets used. Font and audio components are properly licensed.

---

## Visual Moodboard

### Reference Frames

1. **O-Cube Rotation** - Hollow geometric cube with indigo-tinted silver gradient
2. **Petal Burst** - 60 cherry blossom petals radiating from center
3. **Wordmark Reveal** - "Otaku-mori™ 2025" in GameCube-inspired typography
4. **Glow Effects** - Subtle shadows and lighting on metallic surfaces
5. **Background** - Deep indigo gradient with vignette

### Brand Color Swatches

```css
/* Primary Palette */
--otm-ink: #0d0f1c /* Deep indigo background */ --otm-ink-2: #11152a /* Indigo surface */
  --otm-silver: #c7d0ff /* Cube silver */ --otm-rose: #ff6a9c /* Accent rose */
  --otm-sakura: #ffc7d9 /* Sakura light */ --otm-ice: #e8ecff /* Wordmark ice */
  /* Cherry Blossom Variants */ --petal-light: #ffc7d9 /* Light sakura */ --petal-mid: #ff9fbe
  /* Mid sakura */ --petal-deep: #ff6a9c /* Deep sakura accent */;
```

---

## Asset Checklist

| Type        | Filename                  | Format | Notes                          |
| ----------- | ------------------------- | ------ | ------------------------------ |
| **Vector**  | `o-cube.svg`              | SVG    | Hollow rotating cube "O" mark  |
| **Vector**  | `petal-1.svg`             | SVG    | Cherry blossom petal variant 1 |
| **Vector**  | `petal-2.svg`             | SVG    | Cherry blossom petal variant 2 |
| **Vector**  | `petal-3.svg`             | SVG    | Cherry blossom petal variant 3 |
| **Vector**  | `otaku-mori-wordmark.svg` | SVG    | "Otaku-mori™ 2025" wordmark   |
| **Audio**   | `sting.m4a`               | AAC    | 1.2–1.5s chime (160 kbps)      |
| **Audio**   | `sting.wav`               | WAV    | 48 kHz / 24-bit master         |
| **Preview** | `boot-still.png`          | PNG    | Mid-animation frame (1500×844) |

---

## Timing Diagram

```
0.0s ──────────────────────────────────────────────────────────── 3.2s
│    O-Cube Rotate    │ Petal Burst │ Wordmark │ Glow Settle │
│                     │             │ Assemble │ Hand-off    │
│    0.0 ─── 1.0s     │ 1.0 ─ 2.0s  │ 2.0 ─ 2.6s │ 2.6 ─ 3.2s │
│                     │             │           │             │
│  • Spin 720° Y-axis │ • 60 petals │ • Fade in │ • Complete  │
│  • 360° X-axis      │ • Radial    │ • Scale   │ • Handoff   │
│  • Ease out cubic   │ • Random    │ • Glow    │ • Fade out  │
│                     │   rotation  │           │             │
└─────────────────────┴─────────────┴───────────┴─────────────┘
```

### Phase Breakdown

**Phase 1: O-Cube Arrival (0-1000ms)**

- 720° Y-axis rotation, 360° X-axis rotation
- Ease curve: `cubic-bezier(0.45, 0, 0.15, 1)`
- Scale: 1.0 → 1.08 → 1.0 (settle effect)

**Phase 2: Petal Burst (1000-2000ms)**

- 60 petals in 3 color variants
- Radial explosion: 240-380px travel
- Random rotation: 0-45° variance
- Staggered timing: 0.02s delay between petals

**Phase 3: Wordmark Assemble (2000-2600ms)**

- "OTAKU-MORI" fade in with scale animation
- "™ 2025" subtext with 0.2s delay
- Glow effect: `text-shadow` with multiple layers

**Phase 4: Glow Settle (2600-3200ms)**

- Final glow intensity
- Smooth handoff to main interface
- Fade out transition

---

## Motion Cues

### Ease Curves

```css
/* Primary animations */
ease-out-cubic: cubic-bezier(0.45, 0, 0.15, 1)
ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94)
spring: spring(200, 20, 0, 0)
```

### Rotation Specifications

- **O-Cube Y-axis:** 720° (2 full rotations)
- **O-Cube X-axis:** 360° (1 full rotation)
- **Petal rotation:** 0-45° random variance
- **Petal travel:** 240-380px radial distance

### Particle System

- **Total particles:** 60 petals
- **Color distribution:** 33% each variant
- **Lifetime:** 900-1100ms
- **Emission pattern:** Radial burst from center

### Reduced Motion Fallback

```css
@media (prefers-reduced-motion: reduce) {
  /* Skip to wordmark directly */
  /* No particle animations */
  /* Static O-cube display */
  /* Immediate handoff */
}
```

---

## Audio Specifications

### Waveform Structure

```
0.00-0.25s: Bell Hit (C5/E5) - Stereo width ~40%
0.25-0.90s: Warm Body - 5th below + subtle sub (C3)
0.90-1.40s: Air Shimmer - Bandpass sweep, -6dB duck
```

### Technical Specs

- **Format:** 48 kHz / 24-bit WAV master
- **Delivery:** 160 kbps AAC (sting.m4a)
- **Peak Level:** -1.0 dBFS (true-peak safe)
- **Duration:** 1.2-1.5 seconds
- **Stereo Image:** 40% width for mobile compatibility

### Frequency Ranges

- **Hit:** 523-659 Hz (C5-E5)
- **Body:** 131-262 Hz (C3-C4) + sub 65 Hz (C2)
- **Air:** 2-8 kHz bandpass sweep

---

## Legal & Licensing

### Asset Ownership

- **Visual Assets:** Original designs by Otaku-mori team
- **GameCube Inspiration:** Aesthetic reference only, no proprietary assets
- **Typography:** Custom implementation, not Nintendo's proprietary font
- **Audio:** Original composition, no copyrighted material

### License Files

- `LICENSE.md` - Audio licensing terms
- `FONT-LICENSE.md` - Typography licensing (if applicable)

### Usage Rights

- **Perpetual license** for Otaku-mori website usage
- **No redistribution** of assets outside project
- **Attribution required** for any derivative works

---

## Implementation Notes

### File Structure

```
/public/boot/
├── o-cube.svg
├── petal-1.svg
├── petal-2.svg
├── petal-3.svg
├── otaku-mori-wordmark.svg
├── sting.m4a
└── sting.wav
```

### Component Integration

- **Main Component:** `app/components/gamecube/GameCubeBootSequence.tsx`
- **Props:** `onComplete: () => void`, `skipable?: boolean`
- **LocalStorage:** Disabled (shows every visit)
- **Accessibility:** Full reduced-motion support

### Performance Targets

- **60fps** on iPhone 12-15 and mid-range Android
- **<0.02 CLS** (Cumulative Layout Shift)
- **≤3.2s** total duration
- **Graceful degradation** for older devices

---

## Sign-off Area

| Role               | Name     | Initials | Date   |
| ------------------ | -------- | -------- | ------ |
| **Design Lead**    | _[Name]_ | \_\_\_   | _/_/\_ |
| **Audio Engineer** | _[Name]_ | \_\_\_   | _/_/\_ |
| **Frontend Dev**   | _[Name]_ | \_\_\_   | _/_/\_ |
| **QA Lead**        | _[Name]_ | \_\_\_   | _/_/\_ |

---

## Revision History

| Version | Date       | Changes                      | Author   |
| ------- | ---------- | ---------------------------- | -------- |
| 1.0     | 2025-01-08 | Initial asset brief creation | Dev Team |

---

_This document serves as the complete specification for the O-cube boot sequence assets and implementation._
