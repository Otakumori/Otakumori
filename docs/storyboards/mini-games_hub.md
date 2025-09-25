# Mini-Games Hub - GameCube Experience

## User Stories

- As a **gamer**, I want an immersive GameCube-style interface so that I feel nostalgic and excited to play
- As a **first-time user**, I want clear navigation between different game categories so that I can find games I'll enjoy
- As a **returning player**, I want to see my recent orders and progress so that I can continue where I left off
- As a **mobile user**, I want touch-friendly controls for the cube navigation so that I can use it on any device

## Visual Identity

### Background & Atmosphere

- **Background**: Pure black (#000000) for dramatic contrast
- **No Sakura Tree**: Clean separation from homepage identity
- **Lighting**: Subtle ambient purple glow around interactive elements
- **Performance**: Maintain 60fps on all target devices

### GameCube Boot Sequence

- **Frequency**: Once per calendar day per device
- **Storage**: `localStorage["otm_gc_boot_YYYYMMDD"] = true`
- **Session Skip**: `sessionStorage["otm_gc_boot_seen"] = true`
- **Duration**: ~3 seconds total, skippable after 1.2s
- **Controls**: Enter/Space/Click to skip
- **Accessibility**: Static frame for `prefers-reduced-motion`
- **Test Hook**: `data-test="gc-boot-overlay"`

### Cube Interface

- **Position**: Center of viewport, responsive scaling
- **Faces**: UP (Trade), LEFT (Games), RIGHT (Community), DOWN (Music)
- **Input Methods**: Arrow keys, WASD, swipe gestures, click/tap
- **Accessibility**: `aria-roledescription="3D menu"`
- **Test Hooks**: `data-test="gc-cube"`, `data-test="gc-face-[direction]"`

### Memory Card Dock

- **Position**: Bottom-right corner, floating style
- **Content**: Recent Stripe orders as GameCube memory cards
- **Interaction**: Hover/tap for order details
- **Capacity**: Maximum 8 visible cards, scroll for more
- **Authentication**: Only shown for signed-in users

## Face Mapping & Actions

### Configuration Source

Single source of truth: `app/mini-games/cube.map.json`

```json
{
  "faces": {
    "up": { "label": "Trade Center", "action": "route", "href": "/trade" },
    "left": { "label": "Mini-Games", "action": "panel", "panel": "games" },
    "right": { "label": "Avatar / Community Hub", "action": "route", "href": "/community" },
    "down": { "label": "Music / Extras", "action": "panel", "panel": "extras" }
  },
  "frontOverlay": {
    "enabled": true,
    "title": "Otaku-mori Mini-Games",
    "subtitle": "Spin the cube. Choose a panel.",
    "dismissible": true
  }
}
```

### Face Actions

#### UP - Trade Center (Route)

- **Action**: Navigate to `/trade`
- **Animation**: Cube rotates up, brief transition effect
- **Aria Label**: "Open Trade Center"

#### LEFT - Mini-Games (Panel)

- **Action**: Open games panel below cube
- **Content**: Grid of playable mini-games from registry
- **Game Launch**: Disc-load animation (200-400ms) → route to `/mini-games/[slug]`
- **Registry Source**: Existing game list or `/mini-games/list` endpoint

#### RIGHT - Avatar/Community (Route)

- **Action**: Navigate to `/community`
- **Animation**: Cube rotates right, transition effect
- **Aria Label**: "Open Avatar and Community Hub"

#### DOWN - Music & Extras (Panel)

- **Action**: Open extras panel below cube
- **Content**: Sound Test, OST player, BlossomWare microgames
- **Features**: Audio controls, volume, track selection

## UI Components

### GameCubeHub

```typescript
interface GameCubeHubProps {
  bootCompleted: boolean;
  onBootComplete: () => void;
  reducedMotion: boolean;
}
```

### BootOverlay

```typescript
interface BootOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
  reducedMotion: boolean;
}
```

### CubeInterface

```typescript
interface CubeInterfaceProps {
  currentFace: 'front' | 'up' | 'left' | 'right' | 'down';
  onFaceChange: (face: string) => void;
  onFaceActivate: (face: string) => void;
  config: CubeConfig;
}
```

### MemoryCardDock

```typescript
interface MemoryCardDockProps {
  orders: Order[];
  loading: boolean;
  onCardSelect: (order: Order) => void;
}
```

### GamePanel

```typescript
interface GamePanelProps {
  games: GameInfo[];
  onGameSelect: (gameId: string) => void;
  loading: boolean;
}
```

## API Requirements

### Endpoints Needed

- `GET /api/v1/orders/recent` - Recent orders for memory cards
- `GET /api/v1/games/list` - Available mini-games
- `GET /api/v1/games/stats` - Play counts and user progress
- `POST /api/v1/analytics/hub-interaction` - Track cube usage

### Data Schemas

```typescript
interface Order {
  id: string;
  displayNumber: number;
  primaryItemName: string | null;
  label: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status: 'available' | 'locked' | 'coming_soon';
  playCount?: number;
  userProgress?: {
    lastPlayed?: string;
    bestScore?: number;
    completion?: number;
  };
}
```

## Acceptance Criteria

### Boot Sequence Requirements

- [ ] Boot overlay shows once per calendar day
- [ ] Session storage prevents multiple shows per session
- [ ] Skip functionality works after 1.2 seconds
- [ ] Reduced motion shows static frame
- [ ] No console errors during boot sequence

### Cube Navigation Requirements

- [ ] All four directional inputs work (arrows, WASD, swipe, tap)
- [ ] Face rotations are smooth and maintain 60fps
- [ ] Each face has correct aria-label from config
- [ ] Configuration loads from `cube.map.json`
- [ ] Front overlay displays correctly and is dismissible

### Panel System Requirements

- [ ] Games panel displays real data from API
- [ ] Disc-load animation plays before game navigation
- [ ] Music panel shows functional audio controls
- [ ] Panels close when navigating away from face
- [ ] Panel content is keyboard accessible

### Memory Card Requirements

- [ ] Cards display recent orders with correct data
- [ ] Card details show on hover/tap interaction
- [ ] Maximum 8 cards visible with scroll for overflow
- [ ] Cards only show for authenticated users
- [ ] Loading states display appropriately

### Performance Requirements

- [ ] Hub maintains 60fps during all animations
- [ ] Initial load ≤ 2.5 seconds on 4G
- [ ] Cube rotation lag ≤ 100ms from input
- [ ] Memory card data loads in background
- [ ] No frame drops during panel transitions

### Accessibility Requirements

- [ ] Complete keyboard navigation of all elements
- [ ] Screen reader announces cube state changes
- [ ] Focus indicators visible on all interactive elements
- [ ] Reduced motion disables all animations
- [ ] Color contrast meets WCAG 2.1 AA standards

## E2E Test Flow

### First Visit Path

1. **User** navigates to `/mini-games`
2. **System** shows boot overlay with skip option
3. **User** waits or skips boot sequence
4. **System** displays cube interface with front overlay
5. **User** dismisses front overlay
6. **System** shows centered cube ready for interaction

### Cube Navigation Path

1. **User** presses left arrow key
2. **System** rotates cube to show LEFT face
3. **User** presses Enter key
4. **System** opens games panel below cube
5. **User** clicks on Memory Match game
6. **System** plays disc-load animation
7. **System** navigates to `/mini-games/memory-match`

### Memory Card Interaction

1. **User** (authenticated) sees memory card dock
2. **System** displays recent orders as cards
3. **User** hovers over first memory card
4. **System** shows order details tooltip
5. **User** clicks memory card
6. **System** navigates to order details page

### Mobile Touch Path

1. **User** swipes left on cube
2. **System** rotates cube to LEFT face
3. **User** taps the visible face
4. **System** opens games panel
5. **User** taps BlossomWare game
6. **System** navigates to game with loading transition

### Error Scenarios

1. **Network** fails during games list fetch
2. **System** shows retry option with cached fallback
3. **User** tries to access locked game
4. **System** shows unlock requirements or coming soon message
5. **Boot** animation encounters error
6. **System** skips to hub interface with error logged
