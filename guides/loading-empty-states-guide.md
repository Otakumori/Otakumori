# Guide #4: Loading & Empty States Standardization

## Overview

Standardize loading states and empty states across all pages.

## Current State

- **Skeleton components**: `app/components/ui/Skeleton.tsx`
  - `Skeleton` (base)
  - `ProductCardSkeleton`
  - `ShopGridSkeleton`

- **Empty state components**: 
  - `app/components/empty-states/EmptyCart.tsx`
  - `app/components/empty-states/EmptyWishlist.tsx`
  - `app/components/empty-states/EmptyOrders.tsx`
  - `app/components/empty-states/EmptySearch.tsx`

## Standardization Script

See `scripts/standardize-loading-states.mjs` for automated replacement.

## Pages to Update

### Shop Pages

- `app/shop/page.tsx`
- `app/shop/[category]/page.tsx`
- `app/shop/product/[id]/page.tsx`
- `app/shop/cart/page.tsx`

### Profile/Account Pages

- `app/profile/[username]/page.tsx`
- `app/orders/page.tsx`
- `app/wishlist/page.tsx`
- `app/account/storage/page.tsx`

### Game Pages

- `app/mini-games/page.tsx`
- `app/mini-games/[slug]/page.tsx`

## Empty State Integration

Replace custom empty states:

```typescript
// Before
{items.length === 0 && <div>No items found</div>}

// After
import { EmptyWishlist } from '@/app/components/empty-states';
{items.length === 0 && <EmptyWishlist />}
```

## Expected Results

- ✅ Consistent loading states
- ✅ Consistent empty states
- ✅ Better UX
- ✅ Easier maintenance

