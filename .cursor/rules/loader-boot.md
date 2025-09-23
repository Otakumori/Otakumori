# Loader & Boot Animation Standards

## GameCube Boot Sequence

### Visual Requirements

- **Dark background** - Deep purple/black gradient (`from-purple-900 via-purple-800 to-black`)
- **Pink/Purple highlights** - Pink cube, purple accent lighting
- **O-transformation** - G-part of GameCube logo becomes O for "Otaku-mori"
- **Petal explosion** - Bursts from O when cube locks into place
- **Brand text** - "OTAKU-MORI" in GameCube font style

### Animation Phases

1. **Rolling cubes** (900ms) - 4 pink cubes roll in from left
2. **Assembly** (800ms) - Cubes form into O-shaped cube with hollow center
3. **Logo reveal** (800ms) - "OTAKU-MORI" text appears with glow
4. **Petal burst** (1.5s) - 12 pink petals explode from center
5. **Complete** - Transition to main interface

### Timing & Controls

- **Once per day per device** - Use localStorage flag `otm-gamecube-boot-${YYYY-MM-DD}`
- **Skippable** - Skip button in bottom-right corner
- **Non-blocking** - Can navigate away during boot
- **Post-first-run** - Subsequent visits can skip automatically

### Accessibility

- **Reduced motion support** - Skip animation if `prefers-reduced-motion: reduce`
- **Keyboard accessible** - Space/Enter to skip
- **Screen reader** - Announce "Loading GameCube interface" with skip option
- **Performance tracking** - Add `data-gamecube-boot="true"` attribute

### Technical Implementation

```typescript
// localStorage key format
const bootKey = `otm-gamecube-boot-${new Date().toISOString().split('T')[0]}`;

// CSS keyframes required
@keyframes gamecube-roll { /* rolling cubes */ }
@keyframes gamecube-assemble { /* cube formation */ }
@keyframes o-formation { /* hollow center reveal */ }
@keyframes petal-burst { /* petal explosion */ }
@keyframes logo-glow { /* text glow effect */ }
```

### Integration Points

- Triggered on `/mini-games` route entry
- Integrates with `GameCubeHub` component
- Respects user's motion preferences
- Tracks completion for analytics
