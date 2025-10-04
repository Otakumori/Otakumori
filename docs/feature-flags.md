# Feature Flags Documentation

## Overview

This document describes the feature flag system used in Otaku-mori for safe deployment and gradual feature rollouts.

## Phase 1 Safe Mode Flags

### Core Feature Flags

- `NEXT_PUBLIC_FEATURE_HERO=1` - Enable hero section with cherry blossom tree
- `NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE=1` - Enable interactive petal collection
- `NEXT_PUBLIC_FEATURE_SHOP=0` - Enable shop section (disabled by default)
- `NEXT_PUBLIC_FEATURE_MINIGAMES=0` - Enable mini-games section (disabled by default)
- `NEXT_PUBLIC_FEATURE_BLOG=0` - Enable blog section (disabled by default)
- `NEXT_PUBLIC_FEATURE_SOAPSTONES=0` - Enable soapstone community features (disabled by default)

### Data Connection Flags

- `NEXT_PUBLIC_LIVE_DATA=0` - Master kill switch for external API calls (disabled by default)
- `NEXT_PUBLIC_PROBE_MODE=1` - Enable HEAD-style health checks without data fetching

## Usage

### Enabling a Section

To enable a section, set its corresponding flag to `1`:

```bash
NEXT_PUBLIC_FEATURE_SHOP=1
```

### Enabling Live Data

To allow the application to fetch real data from external APIs:

```bash
NEXT_PUBLIC_LIVE_DATA=1
```

### Safe Development

With `NEXT_PUBLIC_LIVE_DATA=0` and `NEXT_PUBLIC_PROBE_MODE=1`:

- Server components perform HEAD-style liveness checks
- No actual data is fetched from external services
- UI shows "Connect to live data" CTAs instead of real content
- Perfect for development and testing without external dependencies

## Implementation

### Server Components

```typescript
import safeFetch from '@/lib/safeFetch';

// Safe data fetching
const response = await safeFetch('/api/v1/products', {
  allowLive: true
});

if (!response.ok) {
  // Show fallback UI or CTA
  return <ConnectToLiveDataCTA />;
}
```

### Client Components

```typescript
// Check feature flags
const isShopEnabled = process.env.NEXT_PUBLIC_FEATURE_SHOP === '1';

if (!isShopEnabled) {
  return null; // Don't render the component
}
```

## Safety Features

- **Timeout Protection**: All external requests timeout after 5 seconds
- **Abort Controller**: Requests can be cancelled if needed
- **Error Boundaries**: Graceful fallbacks for failed requests
- **Caching**: Responses are cached for 1 minute to reduce load
- **No Credentials**: External requests never include authentication tokens

## Migration Path

1. **Phase 1**: All flags disabled, probe mode enabled
2. **Phase 2**: Enable hero and petals, keep others disabled
3. **Phase 3**: Gradually enable shop, mini-games, blog
4. **Phase 4**: Enable live data and full functionality

## Monitoring

- All feature flag usage is logged
- Failed requests are tracked in Sentry
- Performance metrics are collected for each flag
- A/B testing can be implemented using the same flag system
