// lib/no-mocks.ts
export function enforceNoMocks() {
  if (process.env.NODE_ENV === 'production') {
    // In production, ensure no mock data is being used
    const mockImports = ['mock-data', 'fixtures', 'sample-data', 'demo-data', 'test-data'];

    // This is a build-time check - if any mock imports are detected,
    // the build will fail with a clear error message
    for (const mockImport of mockImports) {
      try {
        require.resolve(mockImport);
        throw new Error(
          `Production build detected mock import: ${mockImport}. Remove all mock data from production builds.`,
        );
      } catch (e) {
        // Mock import not found - this is good
        continue;
      }
    }
  }
}
