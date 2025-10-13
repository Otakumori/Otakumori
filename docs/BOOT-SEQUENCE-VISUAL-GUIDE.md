# Boot Sequence Visual Guide

## Color Palette Implementation

### Primary Colors

```css
/* Deep Indigo Background */
--otm-ink: #0d0f1c --otm-ink-2: #11152a /* O-Cube Metallic */ --otm-silver: #c7d0ff
  --otm-silver-border: #9fb0ff /* Cherry Blossom Sakura */ --otm-sakura: #ffc7d9 /* Light */
  --otm-sakura-mid: #ff9fbe /* Medium */ --otm-rose: #ff6a9c /* Deep */ /* Wordmark */
  --otm-ice: #e8ecff;
```

## Visual Phases

### Phase 1: O-Cube Spinning (0-1000ms)

```
┌─────────────────────────────────────────┐
│                                         │
│              ████████████               │
│          ████           ████            │
│        ████               ████          │
│      ████        ◯        ████          │
│        ████               ████          │
│          ████           ████            │
│              ████████████               │
│                                         │
│         [Spinning Animation]            │
└─────────────────────────────────────────┘
```

### Phase 2: Petal Burst (1000-2000ms)

```
┌─────────────────────────────────────────┐
│    🌸               🌸                 │
│        🌸       🌸       🌸            │
│           🌸 ◯ 🌸                     │
│        🌸       🌸       🌸            │
│    🌸               🌸                 │
│                                         │
│         [60 petals radiating]          │
└─────────────────────────────────────────┘
```

### Phase 3: Wordmark (2000-2600ms)

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              OTAKU-MORI                 │
│                   ™ 2025                │
│                                         │
│         [Glowing wordmark]              │
└─────────────────────────────────────────┘
```

## Animation Timing

### Ease Curves

```javascript
// Primary rotation
ease: [0.45, 0, 0.15, 1] // Ease out cubic

// Petal burst
transition: {
  duration: 0.9 + Math.random() * 0.2,
  delay: i * 0.02,
  ease: 'easeOut'
}

// Wordmark reveal
transition: {
  duration: 0.6,
  ease: 'easeOut'
}
```

### Particle System

```javascript
// Petal configuration
const petalCount = 60;
const colors = ['#FFC7D9', '#FF9FBE', '#FF6A9C'];
const travelDistance = 240 + Math.random() * 140;
const rotation = Math.random() * 45;
```

## Accessibility Features

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  /* Skip animations, show final state */
  .boot-sequence {
    animation: none;
    transform: none;
  }
}
```

### Keyboard Navigation

- **Space/Enter/Escape:** Skip boot sequence
- **Tab:** Navigate to skip button
- **Screen reader:** Proper ARIA labels

## Performance Targets

### Frame Rate

- **Target:** 60fps on modern devices
- **Minimum:** 30fps on older devices
- **Optimization:** Hardware-accelerated transforms

### Layout Stability

- **CLS Target:** <0.02
- **No layout shifts** during animation
- **Stable dimensions** throughout sequence

## Brand Consistency

### Typography

- **Font:** Arial (GameCube-inspired)
- **Tracking:** 0.3em for main title
- **Scale:** Responsive sizing
- **Glow:** Subtle text-shadow effects

### Visual Hierarchy

1. **O-Cube:** Primary focus (spinning)
2. **Petal Burst:** Secondary animation (explosion)
3. **Wordmark:** Final reveal (branding)
4. **Skip Button:** Tertiary UI (utility)

---

_This guide provides the complete visual specification for implementing the O-cube boot sequence with proper color usage, timing, and accessibility considerations._
