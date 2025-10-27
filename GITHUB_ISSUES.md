# GitHub Issues for Otaku-mori Monorepo

## PR0: Workspace & Contracts Skeleton

**Status:** ✅ COMPLETE  
**Labels:** `type:infra`, `area:orchestrator`, `priority:P0`

### Description

Set up pnpm workspaces and strict TypeScript/ESLint across repo. Create empty typed packages and CI skeleton.

### Tasks

- [x] Add pnpm-workspace.yaml, root package.json scripts
- [x] Add tsconfig.base.json (strict, noUnused\*, noEmitOnError)
- [x] Add root .eslintrc.cjs (warnings=errors, unused blocked)
- [x] Create packages: @om/avatar, @om/ecs, @om/game-kit, @om/shaders with typed stubs
- [x] Add .github/workflows/ci.yml skeleton (lint/type/build/test/ts-prune)
- [x] Create CONTRACTS.md listing exported types/symbols

### Acceptance Criteria

- [x] All files created
- [ ] CI green after `pnpm install`
- [ ] `pnpm -r lint && pnpm -r type-check && pnpm -r build` passes
- [ ] `ts-prune` prints nothing

### Files Created

```
pnpm-workspace.yaml
tsconfig.base.json
.eslintrc.cjs
packages/avatar/
packages/ecs/
packages/game-kit/
packages/shaders/
app/age-check/page.tsx
app/api/age/confirm/route.ts
components/AgeGateModal.tsx
.github/workflows/ci.yml
scripts/check-links.mjs
CONTRACTS.md
ORCHESTRATOR_IMPLEMENTATION_SUMMARY.md
```

---

## Agent A: R18 Age Gate Implementation

**Status:** 📋 OPEN  
**Labels:** `type:feature`, `area:security`, `priority:P1`  
**Assignee:** Agent A

### Description

Implement session-based R18 age verification system with modal intercept pattern. Protect `/arcade/:path*` and `/products/nsfw/:path*` routes.

### Requirements

- Session-only cookie (no Max-Age)
- Modal intercept pattern (no hard redirects)
- SSR protection via middleware
- Proper a11y for age verification modal

### Files to Implement

- `middleware.ts` - Add age gate logic to existing middleware
- `app/age-check/page.tsx` - Build age verification UI
- `app/api/age/confirm/route.ts` - Add session cookie creation logic
- `components/AgeGateModal.tsx` - Build modal intercept component

### Contracts

**Session Cookie:**

```typescript
// No Max-Age (session-only)
Set-Cookie: otm-age-verified=true; Path=/; HttpOnly; Secure; SameSite=Lax
```

**Middleware:**

```typescript
export const config = {
  matcher: ['/arcade/:path*', '/products/nsfw/:path*'],
};
```

**API Response:**

```typescript
{ ok: true, data: { redirectTo: string } }
```

### Acceptance Criteria

- [ ] Session cookie set with correct flags
- [ ] Middleware redirects unauthenticated users
- [ ] Modal appears on protected route access
- [ ] Keyboard accessible (Enter/Escape)
- [ ] Screen reader announces verification status
- [ ] Works with SSR (no hydration issues)

---

## Agent B: Avatar Renderer Implementation

**Status:** 📋 OPEN  
**Labels:** `type:feature`, `area:avatar`, `priority:P1`  
**Assignee:** Agent B

### Description

Implement high-fidelity avatar renderer using React Three Fiber (R3F) with morph targets, equipment slots, and shader support.

### Requirements

- Validate against `AvatarSpecV15` schema
- Render to provided DOM element
- Respect `reducedMotion` prop
- Clean up resources on dispose
- Support equipment slots (Head, Torso, Legs, Accessory)
- Integrate toon/rim/outline shaders from `@om/shaders`

### Files to Implement

- `packages/avatar/src/renderer/index.ts` - R3F-based renderer
- `packages/avatar/src/serialize.ts` - Serialization logic
- `packages/avatar/src/retarget/retargetMap.json` - Animation retargeting map

### Contracts

**Renderer Props:**

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

**Performance Targets:**

- 60 FPS at 1080p
- < 50k triangles per avatar
- < 10 draw calls per avatar
- Morph target application < 2ms

### Acceptance Criteria

- [ ] Validates `AvatarSpecV15` with Zod
- [ ] Renders avatar to DOM element
- [ ] Applies morph weights correctly
- [ ] Loads equipment from URLs
- [ ] Disables animations when `reducedMotion: true`
- [ ] Cleans up Three.js resources on dispose
- [ ] Integrates toon shader from `@om/shaders`
- [ ] Passes all tests in `packages/avatar/src/__tests__/`

---

## Agent C: Game Systems Implementation

**Status:** 📋 OPEN  
**Labels:** `type:feature`, `area:games`, `priority:P1`  
**Assignee:** Agent C

### Description

Implement ECS core, game loop hook, input system, physics controller, and animation state machine for mini-games.

### Requirements

- 60 FPS target (≤16.6ms frame time)
- Entity Component System with query filtering
- Multi-input support (keyboard, gamepad, touch)
- Basic 2D physics with AABB collision
- Hierarchical animation state machine
- Side-scroller adapter with coyote time

### Files to Implement

- `packages/ecs/src/index.ts` - Full ECS implementation
- `packages/game-kit/src/index.ts` - Input/Physics/Animation systems
- `useGameLoop()` hook implementation

### Contracts

**ECS System:**

```typescript
interface System<T extends ComponentMap> {
  query: Query<T>;
  update: (entities: Array<{ id: EntityId; components: T }>, delta: number) => void;
}
```

**Game Loop:**

```typescript
type GameLoopCallback = (delta: number) => void;
useGameLoop(callback: GameLoopCallback, deps: unknown[]): void;
```

**Performance Targets:**

- Frame time: ≤16.6ms
- Draw calls: <120 per frame
- Triangles: <400k visible
- Physics step: <1ms per entity

### Acceptance Criteria

- [ ] `useGameLoop()` maintains 60 FPS
- [ ] ECS queries filter entities correctly
- [ ] Input system tracks pressed/justPressed/justReleased
- [ ] Gamepad input normalized across browsers
- [ ] Touch input supports multi-touch
- [ ] Physics integrates velocity/acceleration per frame
- [ ] AABB collision detection works
- [ ] Animation HFSM validates transitions
- [ ] Side-scroller has coyote time for jumps
- [ ] Passes all tests in `packages/*/src/__tests__/`

---

## Agent D: Link Checker Implementation

**Status:** 📋 OPEN  
**Labels:** `type:tooling`, `area:ci`, `priority:P2`  
**Assignee:** Agent D

### Description

Implement external product link validator to ensure Printify/Stripe product URLs are valid and accessible.

### Requirements

- Check all product URLs in database
- Verify HTTP 200 response
- Report broken links
- Fail CI if broken links found

### Files to Implement

- `scripts/check-links.mjs` - Link validation logic

### Contracts

**Exit Codes:**

- `0` - All links valid
- `1` - Broken links found

**Output Format:**

```
Checking 145 product links...
✓ Product A - https://...
✗ Product B - https://... (404 Not Found)
✗ Product C - https://... (Timeout)

Summary: 143 valid, 2 broken
```

### Acceptance Criteria

- [ ] Checks all product URLs from Prisma
- [ ] Verifies HTTP 200 status
- [ ] Handles timeouts gracefully (5s timeout)
- [ ] Fails CI with exit code 1 if broken links found
- [ ] Outputs summary with broken link count
- [ ] Respects rate limits (max 10 concurrent)

---

## Additional Issues

### Performance: Bundle Size Optimization

**Labels:** `type:performance`, `area:build`, `priority:P2`

Ensure bundle sizes meet performance budgets:

- Main bundle: ≤230KB gzipped
- Route chunks: ≤150KB gzipped
- Total initial: ≤500KB gzipped

### Accessibility: Keyboard Navigation Audit

**Labels:** `type:a11y`, `area:ui`, `priority:P2`

Audit all interactive elements for keyboard accessibility:

- Tab order logical
- Focus indicators visible
- Skip links present
- No keyboard traps

### Security: CSP Headers Implementation

**Labels:** `type:security`, `area:infra`, `priority:P2`

Implement Content Security Policy headers in `middleware.ts`.

### Monitoring: Sentry Integration

**Labels:** `type:observability`, `area:monitoring`, `priority:P2`

Configure Sentry for error tracking and performance monitoring.

---

## Issue Creation Template

When creating issues from this document:

```markdown
## [Title from above]

**Labels:** [comma-separated labels]
**Priority:** [P0-P3]
**Assignee:** [Agent identifier]

[Description]

### Files to Implement

[List of files]

### Contracts

[Code snippets]

### Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
```
