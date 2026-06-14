/**
 * Lighthouse CI Configuration
 *
 * Defines performance budgets and audit settings for continuous performance monitoring
 */

module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/shop',
        'http://localhost:3000/mini-games',
        'http://localhost:3000/blog',
        'http://localhost:3000/community',
      ],
      // Number of runs for consistency
      numberOfRuns: 3,
      // Start server command
      startServerCommand: 'npm run start',
      // Server startup timeout
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,
    },

    // Performance budgets
    assert: {
      // Bundle size budgets
      budgets: [
        // JavaScript bundles
        {
          resourceType: 'script',
          budget: 500, // 500KB total scripts
        },
        {
          resourceType: 'script',
          budget: 230, // 230KB main bundle
          resourceSizes: [
            {
              resourceType: 'script',
              budget: 230,
            },
          ],
        },

        // CSS budgets
        {
          resourceType: 'stylesheet',
          budget: 100, // 100KB total CSS
        },

        // Image budgets
        {
          resourceType: 'image',
          budget: 500, // 500KB total images
        },

        // Total page budgets
        {
          resourceType: 'total',
          budget: 1000, // 1MB total page size
        },
      ],

      // Core Web Vitals thresholds
      assertions: {
        // Performance score
        'categories:performance': ['error', { minScore: 0.9 }],

        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }], // 2s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // 0.1
        'total-blocking-time': ['error', { maxNumericValue: 300 }], // 300ms

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.9 }],

        // SEO
        'categories:seo': ['error', { minScore: 0.9 }],

        // GameCube specific metrics (if available)
        'speed-index': ['warn', { maxNumericValue: 3000 }], // 3s
        interactive: ['warn', { maxNumericValue: 4000 }], // 4s
      },
    },

    // Upload results to Lighthouse CI server (optional)
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
