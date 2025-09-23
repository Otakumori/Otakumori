# Routing & Navigation Standards

## Global Navigation Requirements

### Header/Footer Consistency

- **Single header render** - no duplicates across routes
- **Footer present on ALL routes** - Home, Shop, Blog, Mini-Games, About, legal pages
- Header must be sticky with proper z-index layering
- Footer contains: Links, Copyright, Help Center, Cookie Settings

### Route Structure

```
/                    - HomePage with cherry blossom tree
/mini-games          - GameCube hub interface
/mini-games/[slug]   - Individual games
/shop               - Product catalog
/blog               - Content hub
/help               - FAQ and support
/cookies            - Cookie preferences
/privacy            - Privacy policy
/terms              - Terms of service
```

### GameCube Hub Labels

- **Top Face**: "Action" - Action games
- **Right Face**: "Puzzle" - Puzzle games
- **Bottom Face**: "Strategy" - Strategy games
- **Left Face**: "All Games" - Complete game list
- Central empty area: "OTAKU-MORI" branding with "Select a face to navigate"

### Navigation State Management

- Active route highlighting in header
- Breadcrumb navigation for nested routes
- Back navigation maintains previous state
- Mobile-responsive navigation with hamburger menu

### Link Standards

- Internal links use Next.js `Link` component
- External links open in new tab with `rel="noopener noreferrer"`
- Email links use `mailto:` protocol
- All links have descriptive text or aria-labels

### Error Handling

- 404 pages with helpful navigation
- Error boundaries with fallback UI
- Graceful degradation for failed route loads
- Clear error messages with next steps

### Performance

- Route-level code splitting
- Prefetch critical navigation targets
- Lazy load non-critical routes
- Minimize layout shift during navigation
