# Homepage Identity & Experience

## User Stories

- As a **first-time visitor**, I want to immediately understand what Otaku-mori offers so that I can decide if it's relevant to me
- As a **returning user**, I want to quickly access my favorite sections (shop, games, profile) so that I can continue my journey
- As a **mobile user**, I want the experience to be touch-friendly and performant so that I can browse comfortably
- As a **accessibility user**, I want full keyboard navigation and screen reader support so that I can use the site independently

## Visual Identity

### Sakura Tree (Left-Anchored)

- **Position**: Fixed left side, half trunk visible, extends full viewport height
- **Styling**: Dark silhouette with subtle pink highlights on branches
- **Interaction**: Tree is static, petals animate independently
- **Responsive**: Scales appropriately on mobile, never blocks content

### Petal System

- **Drift Pattern**: Average 1-2 petals per second, with gusts every 15-20 seconds
- **Physics**: Gentle downward drift with slight horizontal movement
- **Opacity Control**: Petals over H1/CTA limited to ≤0.75 opacity, never block interaction
- **Exclusion Zones**: Halos around inputs/links/buttons prevent petal interference
- **Reduced Motion**: Disables drift animation, retains static tree art

### Counter & Navigation

- **Petal Counter**: In navigation bar with glassmorphic styling and pink glow
- **Tooltips**: Gentle hover reveals without disrupting flow
- **Header**: Sticky with proper z-index layering, never duplicates
- **Footer**: Present on ALL routes with consistent branding

## Content Sections

### Hero Area

- **H1**: "Welcome home, wanderer" (exact copy, pink accent)
- **Subtitle**: Contextual based on user state (new vs returning)
- **Primary CTA**: "Enter the Experience" → `/mini-games`
- **Visual Hierarchy**: Clear focus flow from H1 → subtitle → CTA

### Soapstone Section

- **ID**: `leave-a-sign` for scroll target from footer link
- **Title**: "Leave a sign for fellow travelers" (exact copy)
- **Input Placeholder**: "Compose a sign…"
- **Button**: "Place Sign"
- **Runic Veil**: Reveals on hover/focus/tap interaction

### Three Sneak-Peek Carousels

#### Shop Preview

- **Title**: "Latest Arrivals"
- **Content**: 6 most recent products with images
- **Interaction**: Horizontal scroll on mobile, grid on desktop
- **CTA**: "Explore Shop" → `/shop`

#### Blog Preview

- **Title**: "Community Chronicles"
- **Content**: 3 latest blog posts with excerpts
- **Interaction**: Card-based layout with hover effects
- **CTA**: "Read More" → `/blog`

#### Mini-Games Preview

- **Title**: "Game Realm"
- **Content**: Featured games with play counts
- **Interaction**: Game icons with hover animations
- **CTA**: "Enter Games" → `/mini-games`

### Newsletter Band

- **Position**: Above footer
- **Input**: Email with validation
- **Success Copy**: "Welcome in. Message Received, Commander!" (exact)
- **Integration**: Mailchimp/ConvertKit API

## UI Components

### HomepageLayout

```typescript
interface HomepageLayoutProps {
  children: React.ReactNode;
  showPetals?: boolean;
  reducedMotion?: boolean;
}
```

### SakuraTree

```typescript
interface SakuraTreeProps {
  variant: 'static' | 'animated';
  reducedMotion: boolean;
}
```

### PetalSystem

```typescript
interface PetalSystemProps {
  intensity: 'low' | 'normal' | 'high';
  exclusionZones: DOMRect[];
  reducedMotion: boolean;
}
```

### SneakPeekCarousel

```typescript
interface SneakPeekCarouselProps {
  title: string;
  items: Array<{
    id: string;
    title: string;
    image?: string;
    href: string;
    metadata?: Record<string, any>;
  }>;
  ctaText: string;
  ctaHref: string;
}
```

## API Requirements

### Endpoints Needed

- `GET /api/v1/products/featured` - Shop preview items
- `GET /api/v1/blog/recent` - Latest blog posts
- `GET /api/v1/games/featured` - Featured mini-games
- `POST /api/v1/soapstone` - Place sign functionality
- `POST /api/v1/newsletter/subscribe` - Email subscription

### Data Schemas

```typescript
interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  href: string;
}

interface BlogPreview {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
  readTime: number;
  href: string;
}

interface FeaturedGame {
  id: string;
  name: string;
  description: string;
  icon: string;
  playCount: number;
  href: string;
}
```

## Acceptance Criteria

### Visual Requirements

- [ ] Sakura tree positioned correctly, never blocks content
- [ ] Petal drift averages 1-2/second with periodic gusts
- [ ] Petals respect exclusion zones around interactive elements
- [ ] Header sticky behavior works without z-index conflicts
- [ ] All three carousels display real data from APIs

### Interaction Requirements

- [ ] All CTAs route to correct destinations
- [ ] Soapstone form submits and shows success state
- [ ] Newsletter signup works and shows success message
- [ ] Petal counter displays actual user petal balance
- [ ] Footer "Leave a sign" link scrolls to #leave-a-sign

### Accessibility Requirements

- [ ] Complete keyboard navigation of all interactive elements
- [ ] Screen reader announces all sections and controls
- [ ] Focus indicators visible at minimum 2px pink ring
- [ ] Reduced motion disables petal animation
- [ ] Color contrast meets WCAG 2.1 AA standards

### Performance Requirements

- [ ] LCP < 2.5 seconds on 4G networks
- [ ] Petal system maintains 60fps on modern devices
- [ ] Images optimized with WebP and proper sizing
- [ ] JavaScript bundle ≤ 230KB gzipped for initial load

### Technical Requirements

- [ ] All copy comes from `lib/i18n/en.ts`
- [ ] All components have `data-test` attributes
- [ ] No console errors or CSP violations
- [ ] Proper Open Graph and meta tags set
- [ ] JSON-LD WebSite schema implemented

## E2E Test Flow

### Happy Path

1. **User** visits homepage
2. **System** displays sakura tree and initiates petal drift
3. **User** sees "Welcome home, wanderer" H1 with proper contrast
4. **System** shows three preview carousels with real data
5. **User** scrolls to soapstone section
6. **System** focuses on compose input when clicked
7. **User** types message and clicks "Place Sign"
8. **System** shows success confirmation
9. **User** clicks newsletter signup
10. **System** shows "Welcome in. Message Received, Commander!"

### Accessibility Path

1. **User** navigates with keyboard only
2. **System** provides visible focus indicators throughout
3. **User** activates screen reader
4. **System** properly announces all sections and controls
5. **User** enables reduced motion
6. **System** disables petal animations, maintains visual design

### Error Scenarios

1. **User** submits empty soapstone message
2. **System** shows validation error with clear messaging
3. **User** enters invalid email for newsletter
4. **System** shows format requirements
5. **Network** fails during API calls
6. **System** shows retry options with graceful degradation
