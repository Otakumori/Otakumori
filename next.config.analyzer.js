/**
 * Next.js Bundle Analyzer Configuration
 *
 * This configuration enables webpack bundle analysis for performance monitoring.
 */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: process.env.NODE_ENV === 'development',
});

module.exports = withBundleAnalyzer;
