# Guide #6: Error Boundary Coverage

## Overview

Ensure all major page sections and components are wrapped with error boundaries to prevent cascading failures.

## Current State

### ✅ Existing Error Boundaries

- `app/components/util/ClientErrorBoundary.tsx` - Generic client boundary
- `app/components/errors/GameErrorBoundary.tsx` - Game-specific
- `app/components/errors/ShopErrorBoundary.tsx` - Shop-specific
- `app/components/errors/ProductErrorBoundary.tsx` - Product-specific
- `app/components/home/SectionErrorBoundary.tsx` - Home sections
- `app/error.tsx` - Root error page (Next.js)

### ❌ Missing Coverage

- Individual game pages (`app/mini-games/[slug]/page.tsx`)
- Profile pages (`app/profile/[username]/page.tsx`)
- Community pages (`app/community/*`)
- Trade pages (`app/trade/*`)
- Admin pages (`app/admin/*`)
- Settings pages (`app/account/*`)

## Implementation Strategy

### 1. Create Universal Error Boundary Component

**File**: `app/components/util/UniversalErrorBoundary.tsx`

```typescript
'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@/app/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class UniversalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const sectionName = this.props.sectionName || 'Unknown';
    
    // Log to Sentry/logger
    logger.error('Error boundary caught error', {
      section: sectionName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-lg border border-rose-500/30 bg-rose-900/20">
          <h3 className="text-lg font-semibold text-rose-300 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-rose-200 mb-4">
            {this.props.sectionName 
              ? `An error occurred in ${this.props.sectionName}.`
              : 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm transition"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Wrap Page Components

**Pattern for pages**:

```typescript
// app/mini-games/[slug]/page.tsx
import { UniversalErrorBoundary } from '@/app/components/util/UniversalErrorBoundary';

export default function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <UniversalErrorBoundary sectionName="Game Page">
      {/* Page content */}
    </UniversalErrorBoundary>
  );
}
```

### 3. Wrap Layout Sections

**Pattern for layouts**:

```typescript
// app/layout.tsx or page layouts
<UniversalErrorBoundary sectionName="Navigation">
  <Navbar />
</UniversalErrorBoundary>

<UniversalErrorBoundary sectionName="Main Content">
  {children}
</UniversalErrorBoundary>

<UniversalErrorBoundary sectionName="Footer">
  <Footer />
</UniversalErrorBoundary>
```

## Execution Script

**File**: `scripts/add-error-boundaries.mjs`

See script implementation below.

## Priority Pages

1. **High Priority** (User-facing):
   - `app/mini-games/[slug]/page.tsx`
   - `app/shop/[category]/page.tsx`
   - `app/shop/product/[id]/page.tsx`
   - `app/profile/[username]/page.tsx`

2. **Medium Priority**:
   - `app/community/*/page.tsx`
   - `app/trade/*/page.tsx`
   - `app/account/*/page.tsx`

3. **Low Priority**:
   - `app/admin/*/page.tsx` (internal)

## Expected Results

- ✅ All major pages wrapped with error boundaries
- ✅ Graceful error handling without page crashes
- ✅ Better error logging and debugging
- ✅ Improved user experience on errors

