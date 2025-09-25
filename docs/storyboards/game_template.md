# Mini-Game Template - Universal Contract

## User Stories

- As a **player**, I want every mini-game to feel polished and complete so that I have confidence in the platform
- As a **casual gamer**, I want clear progression and achievement feedback so that I feel motivated to continue
- As a **competitive player**, I want leaderboards and scoring so that I can compare my performance with others
- As a **mobile user**, I want responsive controls that work well on touch devices so that I can play anywhere

## Core Game Contract

### Essential Components

Every mini-game MUST include:

#### 1. Lore Integration

- **Narrative Seed**: Connection to Otaku-mori universe and characters
- **Thematic Consistency**: Visual and audio elements align with dark glass aesthetic
- **Character References**: Subtle nods to anime/gaming culture
- **World Building**: How this game fits into the broader Otaku-mori experience

#### 2. Progression System

- **Save/Resume**: Automatic progress saving via `game_saves` table
- **Checkpoints**: Logical save points during longer gameplay sessions
- **Version Management**: Save data versioning for backward compatibility
- **Recovery**: Graceful handling of corrupted save data

#### 3. Economy Integration

- **Petal Earning**: Clear earning mechanics tied to performance
- **Spending Sinks**: Optional cosmetics, power-ups, or unlocks via Petal Wallet
- **Daily Bonuses**: First-play-of-day rewards
- **Rate Limiting**: Anti-farming protections with fair cooldowns

#### 4. Achievement System

- **Progress Tracking**: Measurable milestones and completion percentages
- **Unlock Notifications**: Satisfying achievement reveals
- **Rarity Tiers**: Common, rare, legendary achievements
- **Social Sharing**: Optional achievement sharing capabilities

#### 5. Competitive Elements

- **Leaderboards**: Daily, weekly, all-time scoring categories
- **Score Submission**: Anti-cheat validation and submission flow
- **Social Features**: Friend comparisons and challenges
- **Seasonal Events**: Limited-time competitions and rewards

## Technical Architecture

### Asset Integration

```typescript
// Assets manifest per game
interface GameAssets {
  sprites: Record<string, string>;
  audio: {
    music: Record<string, string>;
    sfx: Record<string, string>;
  };
  ui: Record<string, string>;
  fonts: Record<string, string>;
}
```

### Save System

```typescript
interface GameSaveData {
  version: number;
  gameId: string;
  slot: number;
  progress: {
    level: number;
    score: number;
    unlocks: string[];
    achievements: string[];
    statistics: Record<string, number>;
  };
  settings: {
    difficulty: 'easy' | 'normal' | 'hard';
    controls: Record<string, any>;
    audio: {
      music: number; // 0-1
      sfx: number; // 0-1
    };
  };
  timestamp: string;
  checksum: string;
}
```

### Petal Economy

```typescript
interface PetalTransaction {
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  gameId: string;
  sessionId: string;
  metadata?: Record<string, any>;
}
```

### Analytics Events

```typescript
interface GameEvent {
  event: 'game_start' | 'game_end' | 'level_complete' | 'achievement_unlock';
  gameId: string;
  sessionId: string;
  data: {
    score?: number;
    level?: number;
    duration?: number;
    petalsEarned?: number;
    achievementId?: string;
  };
  timestamp: string;
}
```

## UI/UX Standards

### Dark Glass Theme

- **Background**: Dark gradients with subtle purple/pink accents
- **Cards**: Glassmorphic panels with backdrop blur
- **Buttons**: Glass buttons with pink hover states
- **Typography**: Consistent with site font stack
- **Spacing**: 8px grid system alignment

### Responsive Design

- **Desktop**: Full keyboard and mouse support
- **Mobile**: Touch-optimized controls with haptic feedback
- **Tablet**: Hybrid input method support
- **Accessibility**: Complete keyboard navigation and screen reader support

### Input Handling

```typescript
interface GameInputConfig {
  keyboard: Record<string, string>; // key -> action mapping
  mouse: {
    click: string;
    drag: string;
    wheel: string;
  };
  touch: {
    tap: string;
    swipe: string;
    pinch: string;
  };
  gamepad?: Record<string, string>; // optional controller support
}
```

## Performance Requirements

### Measurable KPIs

#### Technical Performance

- **Frame Rate**: Maintain 60fps on target devices
- **Load Time**: Initial game load ≤ 3 seconds on 4G
- **Memory Usage**: ≤ 100MB peak memory consumption
- **Bundle Size**: Game-specific JS ≤ 150KB gzipped

#### User Engagement

- **Session Length**: Target average 3-5 minutes per session
- **Retry Rate**: ≥ 70% of players retry after failure
- **Completion Rate**: ≥ 40% complete tutorial/first level
- **Return Rate**: ≥ 30% play again within 24 hours

#### Economic Performance

- **Petal Generation**: Balanced earning rates (~10-50 petals per session)
- **Spending Conversion**: ≥ 20% players spend petals on game features
- **Daily Active**: Track unique daily players per game
- **Revenue Impact**: Correlation with overall platform engagement

## Implementation Checklist

### Pre-Development

- [ ] Asset manifest created and validated
- [ ] Lore integration document written
- [ ] UI mockups approved for dark glass theme
- [ ] Input mapping defined for all device types
- [ ] Performance budget established

### Core Development

- [ ] Game logic implemented with proper state management
- [ ] Save/load system integrated with database
- [ ] Petal earning/spending mechanics implemented
- [ ] Basic achievement tracking added
- [ ] Error boundaries and graceful failure handling

### Polish Phase

- [ ] Audio integration with volume controls
- [ ] Animation polish and reduced motion support
- [ ] Mobile touch controls optimized
- [ ] Loading states and transitions added
- [ ] Help/tutorial system implemented

### Integration Testing

- [ ] Save data persistence across sessions verified
- [ ] Petal transactions properly recorded
- [ ] Leaderboard submission working
- [ ] Achievement unlock notifications functional
- [ ] Analytics events firing correctly

### Accessibility Audit

- [ ] Keyboard navigation complete
- [ ] Screen reader compatibility verified
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus indicators visible and consistent
- [ ] Reduced motion preferences respected

### Performance Validation

- [ ] Frame rate stable on low-end devices
- [ ] Memory usage within budget
- [ ] Bundle size optimized
- [ ] Load time targets met
- [ ] Network requests minimized

## Quality Gates

### Code Review Requirements

- [ ] TypeScript strict mode compliance
- [ ] ESLint errors resolved
- [ ] Unit tests for game logic
- [ ] Integration tests for save system
- [ ] E2E test covering full game flow

### User Acceptance Testing

- [ ] Tutorial completion rate ≥ 80%
- [ ] No blocking bugs reported
- [ ] Performance acceptable on target devices
- [ ] Accessibility requirements met
- [ ] Localization ready (i18n keys in place)

### Launch Readiness

- [ ] Asset optimization complete
- [ ] CDN deployment configured
- [ ] Analytics tracking verified
- [ ] Error monitoring active
- [ ] Rollback plan documented

## Post-Launch Monitoring

### Metrics Dashboard

- Daily active users per game
- Average session duration
- Completion rates by level/difficulty
- Petal economy balance (earn vs spend)
- Achievement unlock distributions
- Performance metrics (FPS, load times)

### Feedback Loops

- User feedback collection in-game
- Community discord monitoring
- Support ticket categorization
- Performance regression detection
- A/B testing framework for improvements
