# ESLint Warning Reduction Plan

## Current Status

- **Total Warnings:** 132
- **Target:** <50 warnings
- **Strategy:** Fix high-impact, easy wins first

## Warning Categories (Priority Order)

### Priority 1: Unused Variables (30+ warnings) - QUICK WINS ✅

**Impact:** High (code cleanliness)
**Effort:** Low (prefix with `_` or remove)

**Files to Fix:**

- `app/components/demos/LightingDemo.tsx` (1 unused var)
- `app/components/effects/AdvancedPetalSystem.tsx` (1 unused arg)
- `app/components/effects/DynamicLightingSystem.tsx` (3 unused vars)
- `app/components/effects/PetalBreathingMode.tsx` (2 unused vars)
- `app/components/PetalGameImage.tsx` (1 unused var)
- `app/hooks/useAdvancedPetals.ts` (1 unused arg)
- `app/hooks/useDynamicLighting.ts` (3 unused args)
- `app/lib/3d/animation-system.ts` (1 unused var)
- `app/lib/3d/model-loader.ts` (1 unused arg)
- `app/lib/3d/performance-optimization.ts` (1 unused arg)
- `app/mini-games/bubble-girl/InteractiveBuddyGame.tsx` (1 unused var)
- `app/mini-games/dungeon-of-desire/DungeonGame.tsx` (2 unused vars)
- `app/mini-games/_shared/GameAvatarIntegration.tsx` (6 unused args)
- `app/mini-games/_shared/GameAvatarRenderer.tsx` (2 unused args)
- `app/mini-games/_shared/GameShellV2.tsx` (1 unused var)
- `app/shop/product/[id]/ProductClient.tsx` (1 unused var)
- `components/arcade/games/NekoLapDance.tsx` (2 unused vars)
- `components/GameControls.tsx` (1 unused var)
- `components/hero/InteractivePetals.tsx` (2 unused vars)
- `lib/analytics/session-tracker.ts` (1 unused var)
- `lib/procedural/cel-shaded-assets.ts` (1 unused var)

**Action:** Prefix all with `_` or remove if truly unused

### Priority 2: Form Labels (10+ warnings) - MEDIUM EFFORT ⚠️

**Impact:** High (accessibility)
**Effort:** Medium (add explicit labels)

**Pattern:**

```tsx
// Before
<input type="text" placeholder="Name" />

// After
<label htmlFor="name">Name</label>
<input id="name" type="text" placeholder="Name" />
```

**Files:**

- `app/components/avatar/CharacterEditor.tsx` (1)
- `app/components/demos/LightingDemo.tsx` (2)
- `app/components/demos/PetalPhysicsDemo.tsx` (2)
- `app/components/shop/ProductSoapstoneWall.tsx` (1)

### Priority 3: Non-interactive Element Interactions (20+ warnings) - MEDIUM EFFORT ⚠️

**Impact:** High (accessibility)
**Effort:** Medium (add keyboard handlers or change to button)

**Pattern:**

```tsx
// Before
<div onClick={handleClick}>Click me</div>

// After
<button onClick={handleClick}>Click me</button>
// OR
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

**Files:** Multiple across components

### Priority 4: Accessible Emoji (60+ warnings) - LOW PRIORITY 📝

**Impact:** Medium (accessibility)
**Effort:** High (wrap all emojis)

**Pattern:**

```tsx
// Before
<span>🎮</span>

// After
<span role="img" aria-label="game controller">🎮</span>
```

**Decision:** Skip for now (can be done in bulk later)

## Implementation Plan

### Phase 1: Quick Wins (Target: 30 warnings fixed) ✅

1. Fix all unused variables by prefixing with `_`
2. Remove truly unused imports
3. **Estimated time:** 30 minutes
4. **Expected result:** 132 → 102 warnings

### Phase 2: Form Labels (Target: 10 warnings fixed) ⚠️

1. Add explicit labels to all form inputs
2. Ensure proper `htmlFor` and `id` associations
3. **Estimated time:** 20 minutes
4. **Expected result:** 102 → 92 warnings

### Phase 3: Interactive Elements (Target: 15 warnings fixed) ⚠️

1. Convert divs with onClick to buttons where appropriate
2. Add keyboard handlers where needed
3. Add proper ARIA roles
4. **Estimated time:** 30 minutes
5. **Expected result:** 92 → 77 warnings

### Phase 4: Remaining (Target: <50 total) 📝

1. Fix autofocus warnings
2. Fix remaining accessibility issues
3. **Estimated time:** 20 minutes
4. **Expected result:** 77 → <50 warnings

## Automated Fix Script

```bash
# Fix unused variables automatically
node scripts/fix-unused-vars-comprehensive.mjs

# Verify fixes
npm run lint
```

## Success Criteria

- ✅ <50 total warnings
- ✅ 0 unused variable warnings
- ✅ 0 form label warnings
- ✅ <20 accessibility warnings
- ✅ All changes maintain functionality

## Notes

- Emoji warnings (60+) are low priority - can be fixed in bulk later
- Focus on high-impact, low-effort fixes first
- Maintain code functionality - don't break existing features
- Test after each phase
