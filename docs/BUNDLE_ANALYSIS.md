# Bundle Analysis Guide

This document outlines the bundle analysis tools and performance monitoring strategies for the Otaku-mori project.

## Bundle Analyzer Setup

The project uses `@next/bundle-analyzer` to analyze webpack bundles and identify optimization opportunities.

### Configuration

- **Config file**: `next.config.analyzer.js`
- **Enabled when**: `ANALYZE=true` environment variable is set
- **Auto-open**: Only in development mode

### Usage

```bash
# Analyze production bundle
npm run build:analyze

# Analyze with performance budgets
npm run perf:analyze

# Simple analysis
npm run analyze
```

## Performance Budgets

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Bundle Size Limits

- **Main bundle**: ≤ 230KB gzipped
- **Route chunks**: ≤ 150KB gzipped each
- **Vendor chunks**: ≤ 200KB gzipped
- **Total initial load**: ≤ 500KB gzipped

## Bundle Analysis Workflow

### 1. Local Analysis

```bash
# Install dependencies
pnpm install

# Run bundle analysis
pnpm run build:analyze

# View results in browser (auto-opens)
```

### 2. CI/CD Integration

The GitHub Actions workflow automatically runs bundle analysis on:

- Pull requests
- Main branch pushes
- Performance regression tests (daily)

### 3. Performance Monitoring

```bash
# Check performance budgets
pnpm run perf:budget

# Generate Lighthouse report
pnpm run lighthouse
```

## Optimization Strategies

### Code Splitting

- Route-level splitting for all pages
- Component-level splitting for heavy components
- Dynamic imports for non-critical features

### Asset Optimization

- Image optimization with Next.js Image component
- Font optimization and preloading
- CSS optimization and purging

### Bundle Optimization

- Tree shaking for unused code elimination
- Minification and compression
- Vendor chunk optimization

## Monitoring & Alerts

### Bundle Size Monitoring

- Automated bundle size tracking in CI
- Performance budget enforcement
- Regression detection and alerts

### Performance Metrics

- Real User Monitoring (RUM) integration
- Core Web Vitals tracking
- Custom performance metrics

## Troubleshooting

### Common Issues

1. **Bundle size increases**
   - Check for new dependencies
   - Analyze bundle composition
   - Implement code splitting

2. **Performance regressions**
   - Compare Lighthouse reports
   - Check bundle analysis differences
   - Review optimization opportunities

3. **Build failures**
   - Check bundle size limits
   - Verify performance budgets
   - Review optimization settings

### Debug Commands

```bash
# Debug bundle composition
ANALYZE=true pnpm run build

# Check specific chunk sizes
pnpm run build:analyze | grep "chunk"

# Performance budget validation
pnpm run perf:budget --verbose
```

## Best Practices

### Development

- Regular bundle analysis during development
- Performance budget awareness
- Optimization-first mindset

### Production

- Automated monitoring and alerting
- Performance regression detection
- Continuous optimization

### Maintenance

- Regular dependency updates
- Bundle analysis reviews
- Performance optimization cycles

## Tools & Resources

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Webpack Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Core Web Vitals](https://web.dev/vitals/)
