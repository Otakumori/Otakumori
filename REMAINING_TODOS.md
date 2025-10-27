# Remaining TODOs - Status Report

## ✅ Completed Infrastructure

- [x] Delete underscore scripts (DONE)
- [x] Enable TypeScript strict mode (DONE)
- [x] Configure ESLint strict rules (DONE)
- [x] Build out core features (13+ features COMPLETE)

## 🎯 Remaining Unused Variables (~35 items)

These fall into 4 categories:

### 1. **Quick Wins** (Can remove immediately) - ~10 items

**Simple unused state/variables:**

- `app/abyss/games/page.js` - `selectedGame`, `setSelectedGame`
- `app/abyss/games/petal-collection/page.js` - `setScore`
- `app/abyss/page.js` - `currentSection`, `setCurrentSection`, `petals`
- `app/components/petals/FallingPetals.tsx` - `_sparkles`
- `app/components/shop/AdvancedShopCatalog.tsx` - `_setSelectedVariant`, `_selectedImage`, `_setSelectedImage`
- `app/components/shop/CheckoutContent.tsx` - `router` (already using it now!)
- `app/components/demos/LightingDemo.tsx` - `_lightingEngine`
- `app/components/effects/PetalBreathingMode.tsx` - `_petals`, `_animationRef`

**Action**: Remove these lines or integrate minimal usage

---

### 2. **Framework/Callback Params** (Add eslint-disable) - ~15 items

**Required by framework signatures but unused:**

**Map callbacks with unused index:**

```typescript
// These need index param but don't use it
items.map((item, _index) => ...)
```

**Files:**

- `app/admin/AdminDashboardClient.tsx` (line 209)
- `app/thank-you/page.tsx` (line 281)
- `app/trade/ui/EquipTray.tsx` (line 196)
- `app/components/tree/TreeStage.tsx` (line 68)
- `app/mini-games/_components/GameCubeHub.tsx` (lines 66, 72, 77, 361, 406, 409)
- `app/components/effects/AdvancedPetalSystem.tsx` (line 82)
- `app/components/Toast.tsx` - `_title`, `_description` params

**3D/Animation delta time params:**

- `app/adults/_components/AdultPreviewScene.safe.tsx` (lines 80, 121)
- `app/components/avatar/Avatar3D.tsx` (line 302)
- `app/mini-games/petal-collection/Scene.tsx` (line 177)
- `app/mini-games/petal-samurai/Game.tsx` (line 115)
- `app/mini-games/bubble-girl/Game.tsx` (line 666)
- `components/games/SamuraiPetalSlice.tsx` (lines 441, 500)

**Route handler params:**

- `app/api/admin/runes/combos/[id]/route.ts`
- `app/api/v1/cart/[id]/route.ts`
- Multiple other API routes with `request` param

**Action**: Add `// eslint-disable-next-line @typescript-eslint/no-unused-vars` above each

---

### 3. **Physics/3D Systems** (Keep for future features) - ~8 items

**Intentional placeholders for upcoming features:**

**Cloth/Physics simulation params:**

```typescript
// app/adults/_components/AdultPreviewScene.safe.tsx
const { mass: _mass, stiffness: _stiffness, damping: _damping } = physicsConfig;
```

These are destructured from config but not used yet. Will be needed when:

- Cloth physics gets implemented
- Spring animations are added
- Bend/stretch calculations are activated

**Files:**

- `app/adults/_components/AdultPreviewScene.safe.tsx` - Physics params (6 vars)
- `app/components/avatar/CharacterEditor.tsx` - `_isDragging`, `_filteredParts`
- `app/character-editor/components/CharacterEditor.tsx` - `_createLowPolyMesh`
- `app/lib/3d/*` - Various LOD and optimization params

**Action**: Keep with TODO comments explaining future use

---

### 4. **Arcade Game Callbacks** (~10 items)

**Standardized callback signature:**

```typescript
// All arcade games have this pattern
function startGame(_onFail: () => void, _duration: number) {
  // onFail callback for future failure animations
  // duration for future timed modes
}
```

**Files:**

- `components/arcade/games/BlossomBounce.tsx`
- `components/arcade/games/BlowTheCartridge.tsx`
- `components/arcade/games/ButtonMashersKiss.tsx`
- `components/arcade/games/ChokeTheController.tsx`
- `components/arcade/games/JoJoThrust.tsx`
- `components/arcade/games/NekoLapDance.tsx`
- `components/arcade/games/PantyRaid.tsx`
- `components/arcade/games/PetalLick.tsx`
- `components/arcade/games/SlapTheOni.tsx`
- `components/arcade/games/ThighTrap.tsx`

**Action**:

- Option A: Implement failure animations and use callbacks
- Option B: Remove params from all games (breaking change to signature)
- Option C: Keep for consistency, add eslint-disable to each

---

## 🎮 Navbar Features to Build

**File**: `app/components/layout/Navbar.tsx`

Currently has these unused:

```typescript
const { user: _user } = useUser(); // Line 50
const {
  requireAuthForSoapstone: _requireAuthForSoapstone,
  requireAuthForWishlist: _requireAuthForWishlist,
} = useAuthContext(); // Lines 52-54
```

**Can build:**

1. **User menu dropdown** (using `user`)
   - Profile link
   - Settings
   - Sign out
   - Display username/avatar

2. **Protected nav links** (using `requireAuthForSoapstone`, `requireAuthForWishlist`)
   - Wishlist button → triggers auth modal if not signed in
   - Soapstone button → triggers auth modal if not signed in
   - Lock icons on protected features

**Would you like me to build these Navbar features?**

---

## 📊 Summary

| Category               | Count   | Action Required    |
| ---------------------- | ------- | ------------------ |
| ✅ Core Features Built | 13+     | COMPLETE           |
| 🗑️ Simple Removals     | ~10     | Remove unused vars |
| 🔧 Framework Params    | ~15     | Add eslint-disable |
| 🚀 Future Features     | ~8      | Keep with TODOs    |
| 🎮 Game Callbacks      | ~10     | Decide approach    |
| **Total Remaining**    | **~43** | Mix of actions     |

## 🎯 Recommended Next Steps

**Option 1: Clean Sweep** (2-3 hours)

- Remove all simple unused vars
- Add eslint-disable to framework params
- Document future feature params
- Implement or remove game callbacks

**Option 2: Feature Focus** (30 min - 1 hour)

- Build Navbar user menu
- Build protected nav links
- Add game failure animations
- Implement score tracking for games

**Option 3: Hybrid** (1 hour)

- Do Option 2 feature builds
- Remove obvious unused vars
- Accept some eslint-disable comments for framework stuff

**Which would you prefer?** I can:

1. Continue building features (Navbar, games, etc.)
2. Do cleanup sweep of remaining unused vars
3. Focus on specific area you choose
