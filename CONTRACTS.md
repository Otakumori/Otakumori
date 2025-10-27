# Otaku-mori Monorepo Contracts

This document defines the shared types, interfaces, and integration points that all agents must adhere to when implementing features in the Otaku-mori monorepo.

## Package Structure

```
packages/
  avatar/     - Avatar system (spec v1.5, renderer, serialization)
  ecs/        - Entity Component System primitives
  game-kit/   - Game development utilities (input, physics, animation)
  shaders/    - Shader definitions (toon, rim light, outline)
```

## @om/avatar

**Package:** `@om/avatar`  
**Version:** 0.0.0  
**Purpose:** High-fidelity avatar specification and rendering system.

### Exports

#### `AvatarSpecV15`

Zod schema defining the avatar specification version 1.5.

```typescript
interface AvatarSpecV15 {
  version: '1.5';
  baseMeshUrl: string;
  rig: { root: string };
  morphs: Array<{
    id: string;
    label: string;
    min: number;
    max: number;
  }>;
  morphWeights: Record<string, number>;
  equipment: {
    Head?: string;
    Torso?: string;
    Legs?: string;
    Accessory?: string;
  };
  palette: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  nsfwPolicy: {
    allowNudity: false;
  };
  animationMap: {
    idle?: string;
    walk?: string;
    run?: string;
    jump?: string;
    fall?: string;
    land?: string;
    attack?: string;
  };
}
```

#### `validateAvatar(spec: unknown): spec is AvatarSpecV15`

Type guard for runtime validation of avatar specs.

**Contract:** Must use `.safeParse()` and return boolean.

#### `clampMorph(spec: AvatarSpecV15, id: string, value: number): number`

Clamps morph weight values to valid ranges.

**Contract:** Must respect `min` and `max` from morph definition.

#### `createRenderer(props: RendererProps): AvatarRenderer`

Factory function for creating avatar renderers.

```typescript
interface RendererProps {
  spec: AvatarSpecV15;
  reducedMotion?: boolean;
}

interface AvatarRenderer {
  mount: (el: HTMLElement) => void;
  dispose: () => void;
}
```

**Contract:**

- Must render avatar to provided DOM element
- Must respect `reducedMotion` prop (disable animations if true)
- Must clean up resources on `dispose()`
- Must handle missing/invalid mesh URLs gracefully

#### `serializeAvatar(spec: AvatarSpecV15): string`

Serializes avatar spec to string format (stub).

#### `deserializeAvatar(data: string): AvatarSpecV15 | null`

Deserializes avatar spec from string (stub).

### Integration Points

**Agent B (Avatar Renderer)** must implement:

1. R3F-based renderer that accepts `RendererProps`
2. Morph target application based on `morphWeights`
3. Equipment slot rendering
4. Animation state machine using `animationMap`
5. Reduced motion support

## @om/ecs

**Package:** `@om/ecs`  
**Version:** 0.0.0  
**Purpose:** Minimal Entity Component System primitives for game development.

### Exports

#### `EntityId`

Branded string type for entity identifiers.

```typescript
type EntityId = string & { readonly __brand: 'EntityId' };
function createEntityId(id: string): EntityId;
```

**Contract:** Use branded type to prevent string/EntityId confusion.

#### `ComponentMap`

Interface for component collections.

```typescript
interface ComponentMap {
  [key: string]: unknown;
}
```

#### `System<T extends ComponentMap>`

System signature for ECS processing.

```typescript
interface Query<T extends ComponentMap> {
  components: (keyof T)[];
}

interface System<T extends ComponentMap> {
  query: Query<T>;
  update: (entities: Array<{ id: EntityId; components: T }>, delta: number) => void;
}
```

**Contract:**

- Systems must declare required components via `query`
- `update()` receives only entities matching the query
- `delta` is time in seconds since last update

#### `UseGameLoopHook`

Hook signature for game loop integration.

```typescript
type GameLoopCallback = (delta: number) => void;
interface UseGameLoopHook {
  (callback: GameLoopCallback, deps: unknown[]): void;
}
```

**Contract:**

- Must use `requestAnimationFrame` for timing
- Must calculate delta time in seconds
- Must respect React dependency array
- Must clean up on unmount

### Integration Points

**Agent C (Game Systems)** must implement:

1. `useGameLoop()` hook for 60 FPS target
2. Component registry for common game components
3. System scheduler for execution order
4. Entity manager for creation/deletion

## @om/game-kit

**Package:** `@om/game-kit`  
**Version:** 0.0.0  
**Purpose:** Game development utilities (input, physics, animation, adapters).

### Exports

#### `InputSystem`

Multi-input system (keyboard, gamepad, touch).

```typescript
interface InputSystem {
  keyboard: KeyboardState;
  gamepad: GamepadState | null;
  touch: TouchState;
  update: () => void;
}
```

**Contract:**

- Must track pressed, justPressed, justReleased states
- Must normalize gamepad inputs across browsers
- Must support multi-touch

#### `PhysicsController`

Basic physics controller for game entities.

```typescript
interface PhysicsController {
  velocity: Vector2;
  acceleration: Vector2;
  checkCollision: (box: CollisionBox) => boolean;
  applyForce: (force: Vector2) => void;
}
```

**Contract:**

- Must integrate velocity/acceleration per frame
- Must provide AABB collision detection
- Performance target: <1ms per entity

#### `AnimationHFSM`

Hierarchical Finite State Machine for animations.

```typescript
interface AnimationHFSM {
  currentState: AnimationState;
  transitions: AnimationTransition[];
  update: (delta: number) => void;
  transition: (to: AnimationState) => void;
}
```

**Contract:**

- Must validate transitions before applying
- Must support hierarchical states
- Must blend between animation states

#### `SideScrollerAdapter`

Platform game adapter for common side-scroller mechanics.

```typescript
interface SideScrollerAdapter {
  config: SideScrollerConfig;
  isGrounded: boolean;
  jump: () => void;
  move: (direction: number) => void;
  update: (delta: number) => void;
}
```

**Contract:**

- Must implement coyote time for jumps
- Must clamp fall speed to `maxFallSpeed`
- Must apply gravity consistently

### Integration Points

**Agent C (Game Systems)** must implement:

1. Input aggregation from all sources
2. Physics step function at 60 Hz
3. Animation state machine with blending
4. Side-scroller controller with feel tuning

## @om/shaders

**Package:** `@om/shaders`  
**Version:** 0.0.0  
**Purpose:** Shader definitions for stylized rendering.

### Exports

#### `ToonShader`

Cel-shaded toon rendering.

```typescript
interface ToonShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: ToonShaderUniforms;
}
```

#### `RimLightShader`

Rim lighting for character highlights.

#### `OutlineShader`

Edge detection outline shader.

**Contract:**

- All shaders must be GLSL ES 3.0 compatible
- Must support uniform updates per frame
- Must be performant (≤0.5ms per shader pass)

### Integration Points

**Agent B (Avatar Renderer)** must implement:

1. Three.js material integration
2. Uniform updates per frame
3. Shader hot-reloading in dev mode

## R18 Age Gate System

### Files

- `middleware.ts` - Session cookie enforcement (session-only, no Max-Age)
- `app/age-check/page.tsx` - Age verification UI
- `app/api/age/confirm/route.ts` - Verification endpoint
- `components/AgeGateModal.tsx` - Modal intercept component

### Routes to Protect

- `/arcade/:path*` - R18 games
- `/products/nsfw/:path*` - R18 products

**Contract:**

- Cookie must be session-only (no expiry)
- Middleware must check cookie before route access
- Modal intercept pattern (no hard redirects)
- SSR protection via middleware

### Integration Points

**Agent A (R18 Gate)** must implement:

1. Session cookie creation with secure flags
2. Middleware route matcher for protected paths
3. Age gate modal with proper a11y
4. API endpoint for verification

## Performance Budgets

### Games (60 FPS Target)

- Frame time: ≤ 16.6ms
- Draw calls: < 120 per frame
- Triangles: < 400k visible
- Memory: < 100MB heap per game

### Core Web Vitals

- LCP: < 2.5s
- FID/INP: < 100ms
- CLS: < 0.1

### Build Output

- Main bundle: ≤ 230KB gzipped
- Route chunks: ≤ 150KB gzipped each
- Total initial: ≤ 500KB gzipped

## Accessibility Requirements

### Motion

- Respect `prefers-reduced-motion: reduce`
- Provide static alternatives for animations
- GameCube boot must be skippable

### Keyboard Navigation

- All interactive elements tabbable
- Focus indicators: `focus:ring-2 focus:ring-pink-500`
- Logical tab order maintained

### Screen Readers

- Descriptive alt text for all images
- Proper ARIA labels for interactive elements
- Live regions for dynamic updates
- Form labels associated with inputs

### Color Contrast

- Normal text: ≥ 4.5:1
- Large text: ≥ 3:1
- UI components: ≥ 3:1

## CI Enforcement

CI pipeline fails on:

1. TypeScript errors (`tsc -b`)
2. ESLint errors (`eslint . --max-warnings=0`)
3. Unused exports (`ts-prune`)
4. Failed tests (`pnpm -r test`)
5. Build failures (`pnpm -r build`)

## GitHub Issues

### PR0: Workspace & Contracts Skeleton

**Labels:** `type:infra`, `area:orchestrator`, `priority:P0`

**Description:**  
Set up pnpm workspaces and strict TypeScript/ESLint across repo. Create empty typed packages and CI skeleton.

**Tasks:**

- [x] Add pnpm-workspace.yaml, root package.json scripts
- [x] Add tsconfig.base.json (strict, noUnused\*, noEmitOnError)
- [x] Add root .eslintrc.cjs (warnings=errors, unused blocked)
- [x] Create packages: @om/avatar, @om/ecs, @om/game-kit, @om/shaders
- [x] Add .github/workflows/ci.yml skeleton
- [x] Create CONTRACTS.md

**Acceptance Criteria:**

- CI green
- `pnpm -r lint && pnpm -r type-check && pnpm -r build` passes
- `ts-prune` prints nothing
- All contracts documented

## Version History

- **v0.0.0** (Initial) - Workspace setup, typed stubs, CI skeleton
