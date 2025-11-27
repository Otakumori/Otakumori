# Guide #3: Metadata/SEO Implementation

## Overview

Add `generateMetadata()` to 74+ pages missing it.

## Current State

- **SEO helper**: `app/lib/seo.ts` - `generateSEO()` function

- **Pages with metadata**: 26/100+

- **Missing metadata**: 74+ pages

## SEO Helper API

```typescript
import { generateSEO } from '@/app/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return generateSEO({
    title: 'Page Title',
    description: 'Page description',
    image: '/path/to/image.png', // optional
    url: '/current-path', // optional
    type: 'website' | 'article' | 'product', // optional, default: 'website'
    price: 29.99, // optional, for products
    currency: 'USD', // optional, default: 'USD'
  });
}
```

## Pages Needing Metadata

### High Priority (User-facing)

1. `app/mini-games/[slug]/page.tsx` - Individual game pages
2. `app/shop/[category]/page.tsx` - Category pages
3. `app/shop/product/[id]/page.tsx` - Product detail pages
4. `app/profile/[username]/page.tsx` - User profiles
5. `app/community/soapstones/page.tsx` - Soapstones page
6. `app/trade/page.tsx` - Trade page
7. `app/parties/page.tsx` - Parties page
8. `app/account/storage/page.tsx` - Storage page

### Medium Priority

- All mini-game pages
- Admin pages (lower SEO priority)
- Settings pages

## Execution Script

See `scripts/add-metadata.mjs` for automated metadata addition.

## Manual Customization Needed

After running the script, manually customize:

- **Dynamic pages**: Fetch actual data for title/description
- **Product pages**: Add price, product images
- **Game pages**: Add game-specific descriptions
- **Profile pages**: Add username to title

## Expected Results

- ✅ All major pages have metadata
- ✅ Better SEO scores
- ✅ Proper Open Graph tags
- ✅ Twitter card support

