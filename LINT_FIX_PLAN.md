# Comprehensive Lint Warning Fix Plan

## Categories of Warnings to Fix

### 1. ✅ Emoji Accessibility (jsx-a11y/accessible-emoji)

**Issue**: Emojis need `<span role="img" aria-label="description">`
**Files**: 20+ files
**Fix**: Wrap all emojis properly

### 2. ✅ Form Label Association (jsx-a11y/label-has-associated-control)

**Issue**: Labels need `htmlFor` attribute or wrap the input
**Files**: Demo components
**Fix**: Add proper label associations

### 3. ✅ Interactive Element Accessibility

**Issue**: Non-interactive elements with click handlers need keyboard support
**Files**: Games, demos
**Fix**: Add keyboard handlers or use proper semantic elements

### 4. ✅ Unused Variables (unused-imports/no-unused-vars)

**Issue**: Variables defined but never used
**Files**: Multiple
**Fix**: Either use them or prefix with underscore if intentionally unused

### 5. ✅ Console Statements (no-console)

**Issue**: console.log instead of console.warn/error
**Files**: Multiple
**Fix**: Replace with proper logging or remove

### 6. ✅ Direct process.env Usage (no-restricted-syntax)

**Issue**: Using process.env directly instead of env.mjs
**Files**: lib/flags.ts, lib/inngestHealth.ts, etc.
**Fix**: Import from @/env

## Implementation Order

1. Fix critical errors (process.env, console.log)
2. Fix accessibility warnings (emojis, labels, keyboard)
3. Fix unused variables
4. Verify with linting

Let's go! 🚀
