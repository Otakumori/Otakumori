# UI Animations Integration Guide

This guide documents all the new UI animation components that have been integrated into the Otakumori project.

## Components Overview

### 1. Enhanced Cursor Glow (`app/components/effects/CursorGlow.tsx`)
**Status**: ✅ Enhanced existing component with hover detection

The cursor glow now detects when hovering over clickable elements (links, buttons, elements with `[data-clickable]`) and intensifies the glow effect.

**Usage**: Already integrated in `app/layout.tsx` via feature flag.

---

### 2. Animated Input (`app/components/ui/AnimatedInput.tsx`)
**Status**: ✅ New component

Animated input field with floating label, focus glow, and error states.

**Usage**:
```typescript
import { AnimatedInput } from '@/app/components/ui/AnimatedInput';

<AnimatedInput
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  success={isValid}
  required
/>
```

**Features**:
- Floating label animation
- Focus glow effect
- Error/success state colors
- Smooth transitions

---

### 3. Gallery Transition (`app/components/animations/GalleryTransition.tsx`)
**Status**: ✅ New component

Animated gallery that transitions between list and grid views with smooth animations.

**Usage**:
```typescript
import { GalleryTransition } from '@/app/components/animations/GalleryTransition';

<GalleryTransition
  items={products.map(p => ({ id: p.id, content: <ProductCard product={p} /> }))}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
/>
```

**Features**:
- List/Grid toggle
- Staggered animations
- Layout transitions
- Click to select items

---

### 4. Pull-to-Refresh (`app/components/animations/PullToRefresh.tsx`)
**Status**: ✅ New component

Mobile-friendly pull-to-refresh with petal animation indicator.

**Usage**:
```typescript
import { PullToRefresh } from '@/app/components/animations/PullToRefresh';

<PullToRefresh
  onRefresh={async () => {
    await fetchProducts();
  }}
  threshold={80}
>
  <ProductList products={products} />
</PullToRefresh>
```

**Features**:
- Touch gesture detection
- Visual pull indicator
- Petal effect on refresh
- Respects reduced motion preferences

---

### 5. Animated Toast (`app/components/notifications/AnimatedToast.tsx`)
**Status**: ✅ New component

Enhanced toast notifications with spring animations and icon animations.

**Usage**:
```typescript
import { AnimatedToast } from '@/app/components/notifications/AnimatedToast';

<AnimatedToast
  id="toast-1"
  message="Item added to cart!"
  type="success"
  duration={5000}
  onClose={(id) => removeToast(id)}
/>
```

**Types**: `success`, `error`, `info`, `warning`

**Features**:
- Spring entrance/exit animations
- Rotating icon animation
- Color-coded by type
- Auto-dismiss with fade

---

### 6. Animated Toggle (`app/components/ui/AnimatedToggle.tsx`)
**Status**: ✅ New component

Smooth toggle switch with glow effect when checked.

**Usage**:
```typescript
import { AnimatedToggle } from '@/app/components/ui/AnimatedToggle';

<AnimatedToggle
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Enable notifications"
  disabled={false}
/>
```

**Features**:
- Spring animation for toggle
- Glow pulse when checked
- Accessible label support
- Disabled state handling

---

### 7. Animated Sign In (`app/components/auth/AnimatedSignIn.tsx`)
**Status**: ✅ New component

Complete sign-in form with staggered field animations.

**Usage**:
```typescript
import { AnimatedSignIn } from '@/app/components/auth/AnimatedSignIn';

<AnimatedSignIn />
```

**Features**:
- Staggered field entrance
- Loading state animation
- Form validation ready
- Smooth transitions

---

### 8. Animated Form (`app/components/forms/AnimatedForm.tsx`)
**Status**: ✅ New component

Generic animated form component with field definitions.

**Usage**:
```typescript
import { AnimatedForm } from '@/app/components/forms/AnimatedForm';

<AnimatedForm
  fields={[
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ]}
  onSubmit={(data) => console.log(data)}
/>
```

**Features**:
- Dynamic field generation
- Staggered animations
- Error handling support
- Form validation ready

---

### 9. Scroll Select (`app/components/animations/ScrollSelect.tsx`)
**Status**: ✅ New component

Scrollable selection component with snap scrolling and visual feedback.

**Usage**:
```typescript
import { ScrollSelect } from '@/app/components/animations/ScrollSelect';

<ScrollSelect
  items={[
    { id: '1', label: 'Option 1', value: 'opt1' },
    { id: '2', label: 'Option 2', value: 'opt2' },
  ]}
  onSelect={(value) => console.log(value)}
  selectedId={selectedId}
/>
```

**Features**:
- Snap scrolling
- Visual scale/opacity feedback
- Click to select
- Smooth scroll animations

---

### 10. Glowing Social Icons (`app/components/footer/GlowingSocialIcons.tsx`)
**Status**: ✅ New component

Social media icons with hover glow effects.

**Usage**:
```typescript
import { GlowingSocialIcons } from '@/app/components/footer/GlowingSocialIcons';

<GlowingSocialIcons />
```

**Features**:
- Platform-specific colors
- Hover glow animation
- Staggered entrance
- Rotate on hover

**Integration**: Add to Footer component:
```typescript
import { GlowingSocialIcons } from '@/app/components/footer/GlowingSocialIcons';

// In Footer component
<GlowingSocialIcons />
```

---

### 11. GameCube Menu (`app/components/mini-games/GameCubeMenu.tsx`)
**Status**: ✅ New component

3D card flip animation for game selection (inspired by CodePen).

**Usage**:
```typescript
import { GameCubeMenu } from '@/app/components/mini-games/GameCubeMenu';

<GameCubeMenu
  games={[
    { id: '1', title: 'Petal Samurai', thumbnail: '/games/petal-samurai.jpg' },
    { id: '2', title: 'Memory Match', thumbnail: '/games/memory-match.jpg' },
  ]}
/>
```

**Features**:
- 3D card flip on click
- Staggered entrance
- Hover rotation
- Game thumbnail display

**Integration**: Use in mini-games hub:
```typescript
import { GameCubeMenu } from '@/app/components/mini-games/GameCubeMenu';

// Replace existing game grid with:
<GameCubeMenu games={games} />
```

---

### 12. Interactive Card (`app/components/games/InteractiveCard.tsx`)
**Status**: ✅ New component

3D tilt card effect that responds to mouse movement (game-inspired).

**Usage**:
```typescript
import { InteractiveCard } from '@/app/components/games/InteractiveCard';

<InteractiveCard onClick={() => navigate('/game')}>
  <h3>Game Title</h3>
  <p>Game description</p>
</InteractiveCard>
```

**Features**:
- 3D tilt on mouse move
- Hover scale effect
- Dynamic shadow
- Click handler support

**Integration**: Wrap product/game cards:
```typescript
import { InteractiveCard } from '@/app/components/games/InteractiveCard';

<InteractiveCard onClick={() => router.push(`/shop/${product.id}`)}>
  <ProductCardContent product={product} />
</InteractiveCard>
```

---

## CSS Utilities Added

The following CSS classes have been added to `app/globals.css`:

- `.perspective-1000` - 3D perspective container
- `.preserve-3d` - Preserve 3D transforms
- `.backface-hidden` - Hide backface of 3D elements
- `.rotate-y-180` - Rotate 180 degrees on Y axis
- `.scrollbar-hide` - Hide scrollbar but keep scrolling
- `.snap-y` - Vertical snap scrolling
- `.snap-center` - Center snap alignment
- `[data-clickable]` - Cursor pointer for clickable elements

---

## Accessibility

All components respect `prefers-reduced-motion`:
- Animations are disabled when user prefers reduced motion
- Static fallbacks provided
- Keyboard navigation supported
- Screen reader friendly

---

## Performance

- All animations use `transform` and `opacity` for GPU acceleration
- `will-change` applied where appropriate
- Reduced motion detection prevents unnecessary animations
- 60fps target maintained

---

## Integration Checklist

- [x] CursorGlow enhanced with hover detection
- [x] AnimatedInput component created
- [x] GalleryTransition component created
- [x] PullToRefresh component created
- [x] AnimatedToast component created
- [x] AnimatedToggle component created
- [x] AnimatedSignIn component created
- [x] AnimatedForm component created
- [x] ScrollSelect component created
- [x] GlowingSocialIcons component created
- [x] GameCubeMenu component created
- [x] InteractiveCard component created
- [x] CSS utilities added to globals.css
- [x] All components respect reduced motion
- [x] TypeScript types verified

---

## Next Steps

1. **Integrate GlowingSocialIcons into Footer**: Replace existing social icons
2. **Use GameCubeMenu in mini-games hub**: Replace existing game grid
3. **Wrap product cards with InteractiveCard**: Add 3D tilt effect
4. **Replace standard inputs with AnimatedInput**: Enhance form UX
5. **Add PullToRefresh to mobile pages**: Improve mobile experience
6. **Use AnimatedToast for notifications**: Replace existing toast system

---

## Examples

### Product Card with Interactive Effect
```typescript
import { InteractiveCard } from '@/app/components/games/InteractiveCard';
import Image from 'next/image';

<InteractiveCard onClick={() => router.push(`/shop/${product.id}`)}>
  <Image src={product.image} alt={product.name} width={300} height={300} />
  <h3>{product.name}</h3>
  <p>${product.price}</p>
</InteractiveCard>
```

### Form with Animated Inputs
```typescript
import { AnimatedInput } from '@/app/components/ui/AnimatedInput';

<form>
  <AnimatedInput
    label="Full Name"
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
  />
  <AnimatedInput
    label="Email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error={emailError}
    required
  />
</form>
```

---

## Notes

- All components use Framer Motion for animations
- Components are client-side only (`'use client'`)
- Reduced motion preferences are checked and respected
- Performance optimized for 60fps
- Accessible by default

