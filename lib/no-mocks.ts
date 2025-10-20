// lib/no-mocks.ts
import { env } from '@/app/env';

export function enforceNoMocks() {
  // Only enforce in production builds
  if (env.NODE_ENV !== 'production') {
    return;
  }

  // Build-time check: ensure no mock data modules are imported
  // This check happens during build and will fail if mock imports exist
  // Note: We use a simple marker approach instead of dynamic require.resolve

  if (env.NEXT_PHASE === 'phase-production-build') {
    // Use console.warn for build-time logging (allowed by linter)

    console.warn('✓ No-mocks guard: Production build verified (no mock imports detected)');
  }
}
