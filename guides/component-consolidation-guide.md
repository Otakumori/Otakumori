# Guide #7: Component Directory Consolidation

## Overview

Migrate all components from root `components/` directory to `app/components/` for consistency and Next.js App Router best practices.

## Current State

### Duplicate Component Directories

- `app/components/` (320 files) - Primary location ✅
- `components/` (root) - Legacy location ❌

### Known Duplicates

- `components/ErrorBoundary.tsx` vs `app/components/util/ClientErrorBoundary.tsx`
- `components/Toast.tsx` vs `app/components/Toast.tsx`
- `components/SoundSettings.tsx` vs `app/components/SoundSettings.tsx`
- `components/hero/FeaturedProducts.tsx` vs `app/components/hero/FeaturedProducts.tsx`

## Migration Strategy

### Phase 1: Audit and Map

1. **Find all components in root `components/`**
2. **Check if duplicates exist in `app/components/`**
3. **Map import paths to new locations**

### Phase 2: Update Imports

1. **Update all imports from `@/components/` to `@/app/components/`**
2. **Update relative imports**
3. **Fix any broken references**

### Phase 3: Delete Legacy Directory

1. **Verify no remaining imports**
2. **Delete `components/` directory**
3. **Update any build/config references**

## Execution Script

**File**: `scripts/consolidate-components.mjs`

See script implementation below.

## Manual Steps

1. **Review duplicates** - Choose which version to keep
2. **Test imports** - Verify all imports work
3. **Delete legacy directory** - After verification
4. **Update documentation** - Update any component docs

## Expected Results

- ✅ Single source of truth: `app/components/`
- ✅ Consistent import paths
- ✅ No duplicate components
- ✅ Cleaner project structure

