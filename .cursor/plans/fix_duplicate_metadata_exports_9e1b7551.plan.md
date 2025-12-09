---
name: Fix duplicate metadata exports
overview: Remove duplicate metadata exports from 9 files that are causing Next.js build failures. Each file currently exports both `metadata` constant and `generateMetadata()` function, which is not allowed in Next.js 15.
todos: []
---

# Fix Duplicate Metadata Exports

## Problem

9 files export both `export const metadata` and `export function generateMetadata()`, which causes Next.js build errors: "metadata and generateMetadata cannot be exported at the same time".

## Solution

For each file, remove the static `metadata` export and keep only `generateMetadata()`. Also fix URL paths and improve metadata content.

## Files to Fix

### Mini-Games Pages (6 files)

1. **[app/mini-games/petal-run/page.tsx](app/mini-games/petal-run/page.tsx)**

- Remove: `export const metadata = { title: 'Petal Run | Otaku-mori' };`
- Update `generateMetadata()`: title to "Petal Run", URL to `/mini-games/petal-run`

2. **[app/mini-games/petal-collection/page.tsx](app/mini-games/petal-collection/page.tsx)**

- Remove: `export const metadata: Metadata = { ... }` and `import type { Metadata } from 'next';`
- Update `generateMetadata()`: title to "Petal Collection", description to "Collect falling petals and rack up combos.", URL to `/mini-games/petal-collection`

3. **[app/mini-games/quick-math/page.tsx](app/mini-games/quick-math/page.tsx)**

- Remove: `export const metadata = { title: 'Quick Math | Otaku-mori' };`
- Update `generateMetadata()`: title to "Quick Math", URL to `/mini-games/quick-math`

4. **[app/mini-games/memory/page.tsx](app/mini-games/memory/page.tsx)**

- Remove: `export const metadata = { title: 'Memory | Otaku-mori' };`
- Update `generateMetadata()`: title to "Memory", URL to `/mini-games/memory`

5. **[app/mini-games/maid-cafe-manager/page.tsx](app/mini-games/maid-cafe-manager/page.tsx)**

- Remove: `export const metadata = { title: 'Maid Café Manager | Otaku-mori' };`
- Update `generateMetadata()`: title to "Maid Café Manager", URL to `/mini-games/maid-cafe-manager`

6. **[app/mini-games/bubble-ragdoll/page.tsx](app/mini-games/bubble-ragdoll/page.tsx)**

- Remove: `export const metadata = { title: 'Bubble Ragdoll' };`
- Update `generateMetadata()`: title to "Bubble Ragdoll", URL to `/mini-games/bubble-ragdoll`

### Profile Pages (3 files)

7. **[app/profile/petals/page.tsx](app/profile/petals/page.tsx)**

- Remove: `export const metadata: Metadata = { ... }` and `import type { Metadata } from 'next';`
- Update `generateMetadata()`: title to "Petals", description to "Track your petal collection and rewards.", URL to `/profile/petals`

8. **[app/profile/orders/page.tsx](app/profile/orders/page.tsx)**

- Remove: `export const metadata: Metadata = { ... }` and `import type { Metadata } from 'next';`
- Update `generateMetadata()`: title to "Orders", description to "View your order history and track shipments.", URL to `/profile/orders`

9. **[app/profile/achievements/page.tsx](app/profile/achievements/page.tsx)**

- Remove: `export const metadata: Metadata = { ... }` and `import type { Metadata } from 'next';`
- Update `generateMetadata()`: title to "Achievements", description to "View your unlocked achievements and progress.", URL to `/profile/achievements`

## Implementation Details

- All URL paths will be converted from Windows file paths (e.g., `/C:\Users\...`) to proper route paths (e.g., `/mini-games/petal-run`)
- Titles and descriptions in `generateMetadata()` will match the content from the removed static `metadata` exports
- Unused `Metadata` type imports will be removed where applicable
- All changes maintain existing functionality while fixing the build errors