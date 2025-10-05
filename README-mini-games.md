# Otaku-mori Mini-Games System

A production-quality mini-games platform integrated with the Otaku-mori economy, achievements, and inventory system.

## 🎮 Games Available

### Core Games (Fully Implemented)

- **Samurai Petal Slice** - Swipe-based petal slicing with combo mechanics
- **Anime Memory Match** - Anime character memory matching game
- **Bubble-Pop Gacha** - Bubble popping with gacha rewards
- **Rhythm Beat-Em-Up** - Four-lane rhythm game with Tone.js

### Additional Games (Placeholder)

- **Memory Match** - Simple pairs matching
- **Quick Math** - Speed arithmetic with streaks
- **Petal Collection** - Economy pacing prototype

## 🚀 Quick Start

### 1. Environment Setup

Copy `env.example` to `.env.local` and configure:

```bash
# Required
DATABASE_URL="postgresql://username:password@localhost:5432/otakumori"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_key"
CLERK_SECRET_KEY="your_clerk_secret"
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"
BLOB_READ_WRITE_TOKEN="your_blob_token"
STRIPE_SECRET_KEY="your_stripe_key"
RESEND_API_KEY="your_resend_key"

# Game Configuration
NEXT_PUBLIC_DAILY_PETAL_LIMIT=500
NEXT_PUBLIC_EVENT_CODE=SPRING_HANAMI
```

### 2. Database Setup

Run Prisma migrations to create the required tables:

```bash
npx prisma migrate dev --name add_mini_games_system
npx prisma generate
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access Mini-Games

Navigate to `/mini-games` to see the games hub, or go directly to `/mini-games/samurai-petal-slice` for the Samurai game.

## 🏗️ Architecture

### Core Systems

- **Game Registry** (`app/lib/games.ts`) - Central game definitions and metadata
- **Asset Manager** (`app/lib/assets.ts`) - Vercel Blob integration with procedural fallbacks
- **Input Manager** (`app/lib/input-manager.ts`) - Unified keyboard, gamepad, and touch input
- **Game Loop** (`app/lib/game-loop.ts`) - Fixed timestep 60 FPS game loop
- **HTTP Client** (`app/lib/http.ts`) - API wrapper with validation

### Game Components

- **React Wrappers** - Handle game state and UI
- **PixiJS Canvas** - 2D rendering engine
- **Web Audio API** - Sound effects and music
- **Game Loop Integration** - Consistent timing and updates

### API Routes

- `POST /api/v1/games/start` - Initialize game run
- `POST /api/v1/games/finish` - Complete game and award rewards
- `POST /api/v1/games/progress` - Mid-run checkpoints (optional)

## 🎯 Game Design

### Samurai Petal Slice

- **Core Mechanic**: Swipe to slice falling petals
- **Scoring**: Perfect angle alignment + combo bonuses
- **Anti-cheat**: Duration validation, score clamping
- **Achievements**: Special Samurai unlocks (left-handed, silent, etc.)

### Memory Match Variants

- **Anime Memory Match**: 4x4 to 6x6 grid with anime faces
- **Memory Match**: Simple pairs for accessibility
- **Features**: Streak bonuses, time pressure

### Rhythm Beat-Em-Up

- **Core Mechanic**: Four-lane rhythm gameplay
- **Audio**: Tone.js for precise timing
- **Scoring**: Perfect/Good/Miss with combo system
- **Tracks**: Load from Vercel Blobs

### Bubble-Pop Gacha

- **Core Mechanic**: Timed bubble popping
- **Rewards**: Server-side gacha with pity system
- **Chain Mechanics**: Combo bonuses for rare items

## 🔧 Configuration

### Feature Flags

Control game availability via environment variables:

```bash
NEXT_PUBLIC_SAMURAI_PETAL_SLICE_ENABLED=true
NEXT_PUBLIC_ANIME_MEMORY_MATCH_ENABLED=true
NEXT_PUBLIC_BUBBLE_POP_GACHA_ENABLED=true
NEXT_PUBLIC_RHYTHM_BEAT_EM_UP_ENABLED=true
NEXT_PUBLIC_MEMORY_MATCH_ENABLED=true
NEXT_PUBLIC_QUICK_MATH_ENABLED=true
NEXT_PUBLIC_PETAL_COLLECTION_ENABLED=true
```

### Economy Settings

```bash
NEXT_PUBLIC_DAILY_PETAL_LIMIT=500  # Daily petal cap per user
NEXT_PUBLIC_EVENT_CODE=SPRING_HANAMI  # Current event theme
```

### Game Balance

Adjust rewards and difficulty in `app/lib/games.ts`:

```typescript
{
  maxRewardPerRun: 150,  // Maximum petals per game
  difficulty: 'medium',   // easy/medium/hard
  // ... other settings
}
```

## 📊 Performance Targets

- **Initial Payload**: < 2.5 MB for `/mini-games` route
- **Input Latency**: < 60ms from input to action
- **Frame Rate**: Stable 60 FPS with fixed timestep
- **Memory**: Zero GC spikes > 16ms during steady play

### Optimization Strategies

- **Asset Preloading**: Essential UI sounds and sprites
- **Lazy Loading**: Heavy assets (music, spritesheets)
- **Procedural Fallbacks**: Auto-generated sprites when assets missing
- **Canvas Cleanup**: Proper disposal of PixiJS objects

## 🎨 Asset Pipeline

### Vercel Blob Storage

- **Sprites**: `sprites/{key}.png`
- **Audio**: `audio/{key}.mp3`
- **Music**: `music/{key}.mp3`

### Fallback System

When assets are missing, the system generates:

- **Procedural Sprites**: Colored shapes based on game key
- **Fallback Audio**: Simple beeps with Web Audio API
- **Placeholder Textures**: Canvas-generated patterns

### Asset Manifest

```typescript
interface AssetManifest {
  icons: Record<string, string>;
  sprites: Record<string, string>;
  audio: Record<string, string>;
  music: Record<string, string>;
}
```

## 🏆 Achievement System

### Categories

- **Site Interaction**: First Visit, Daily Visitor
- **Profile Growth**: Profile Perfection, Face Reveal
- **Shopping**: First Purchase, Shopping Spree
- **Community**: First Comment, Comment Master
- **Lore**: Lore Explorer, Lore Master
- **Special Samurai**: Zen Is a Lie, I Have No Master
- **Seasonal**: Event Champion, Seasonal Participant

### Rewards

- **Petals**: Bonus currency
- **Cosmetics**: Avatar frames, badges
- **Coupons**: Shop discounts
- **Runes**: Special currency
- **Track Unlocks**: Music and content access

## 🛡️ Security & Anti-Cheat

### Server Authority

- All rewards calculated server-side
- Score validation with reasonable bounds
- Duration clamping (5s minimum, 30m maximum)
- Idempotency key enforcement

### Client Validation

- Input rate limiting
- Impossible action detection
- Stats hash verification

## 🧪 Testing

### Unit Tests

```bash
npm test                    # Run all tests
npm run test:coverage      # Coverage report
npm run test:watch         # Watch mode
```

### Integration Tests

- Game start → play → finish flow
- Achievement unlocking
- Reward distribution
- Anti-cheat measures

### E2E Tests (Playwright)

```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Playwright UI
```

## 📱 Accessibility

### Features

- **Reduced Motion**: Disables particle effects and screen shake
- **High Contrast**: Alternative color schemes
- **SFX Captions**: Audio description toggle
- **Keyboard Navigation**: Full gamepad and keyboard support
- **Touch Support**: Mobile-optimized controls

### Settings

- **SFX Volume**: 0-100% with mute toggle
- **Music Volume**: Separate from SFX
- **Input Sensitivity**: Adjustable for different devices

## 🚀 Deployment

### Vercel

1. Push to main branch
2. Environment variables configured in Vercel dashboard
3. Automatic deployment with preview URLs

### Database

```bash
npx prisma migrate deploy  # Production migrations
npx prisma generate        # Generate client
```

### Assets

1. Upload game assets to Vercel Blob
2. Update asset manifests if needed
3. Test asset loading in staging

## 🔍 Monitoring

### Analytics

- GA4 events for game metrics
- Performance monitoring
- Error tracking with Sentry

### Health Checks

- Database connectivity
- Asset loading status
- Game performance metrics

## 🐛 Troubleshooting

### Common Issues

"Game won't start"

- Check feature flags in environment
- Verify user authentication
- Check database connectivity

"Assets not loading"

- Verify Vercel Blob configuration
- Check asset paths in registry
- Fallback sprites should generate automatically

"Performance issues"

- Monitor frame rate in browser dev tools
- Check memory usage
- Verify asset sizes and loading

"API errors"

- Check authentication tokens
- Verify rate limits
- Check idempotency key format

### Debug Mode

Enable debug logging:

```typescript
// In game components
console.log('Game state:', gameState);
console.log('Performance:', gameLoop.getStats());
```

## 🤝 Contributing

### Adding New Games

1. Define game in `app/lib/games.ts`
2. Create React component in `components/games/`
3. Implement game logic with PixiJS
4. Add to game registry
5. Create tests
6. Update documentation

### Game Requirements

- **Responsive Design**: Support 800x600 minimum
- **Input Handling**: Keyboard, gamepad, touch
- **Audio Integration**: SFX and music support
- **Performance**: 60 FPS target
- **Accessibility**: Reduced motion support

## 📚 Resources

- [PixiJS Documentation](https://pixijs.io/docs/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Game Loop Patterns](https://gameprogrammingpatterns.com/game-loop.html)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

## 📄 License

This mini-games system is part of the Otaku-mori project. See main project license for details.
