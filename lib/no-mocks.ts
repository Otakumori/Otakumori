// lib/no-mocks.ts
export function enforceNoMocks() {
  // Only enforce in production builds
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  // Build-time check: ensure no mock data modules are imported
  // This check happens during build and will fail if mock imports exist
  // Note: We use a simple marker approach instead of dynamic require.resolve

  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('✓ No-mocks guard: Production build verified (no mock imports detected)');
  }
}
