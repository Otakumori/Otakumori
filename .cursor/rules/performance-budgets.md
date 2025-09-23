# Performance Budget Standards

## Core Web Vitals Targets

### Largest Contentful Paint (LCP)

- **Target**: < 2.5 seconds on 4G networks
- **Measurement**: Track first meaningful paint of hero content
- **Optimization**: Preload critical resources, optimize images, minimize render-blocking

### First Input Delay (FID) / Interaction to Next Paint (INP)

- **Target**: < 100ms for user interactions
- **Measurement**: Response time to user inputs
- **Optimization**: Minimize main thread blocking, optimize JavaScript execution

### Cumulative Layout Shift (CLS)

- **Target**: < 0.1 layout shift score
- **Measurement**: Visual stability during page load
- **Optimization**: Reserve space for images, avoid dynamic content insertion

## JavaScript Bundle Budgets

### Chunk Size Limits

- **Main bundle**: ≤ 230KB gzipped
- **Route chunks**: ≤ 150KB gzipped each
- **Vendor chunks**: ≤ 200KB gzipped
- **Total initial load**: ≤ 500KB gzipped

### Bundle Analysis

```bash
# Monitor bundle sizes
npm run build -- --analyze
npx @next/bundle-analyzer
```

### Code Splitting Strategy

- Route-level splitting for all pages
- Component-level splitting for heavy components
- Dynamic imports for non-critical features
- Lazy loading for below-fold content

## GameCube Performance

### Animation Targets

- **60 FPS idle performance** in GameCube hub
- **Smooth 60 FPS** during boot sequence
- **No frame drops** during cube rotations
- **Hardware acceleration** for 3D transforms

### Memory Management

- **Cleanup animation frames** on component unmount
- **Dispose of Three.js resources** if used
- **Limit concurrent animations** (max 3 simultaneous)
- **Use `will-change` sparingly** and remove after animation

## Image Optimization

### Format Standards

- **WebP** for modern browsers with JPEG fallback
- **AVIF** for supported browsers
- **SVG** for icons and simple graphics
- **Responsive images** with multiple sizes

### Size Guidelines

- **Hero images**: ≤ 100KB optimized
- **Thumbnails**: ≤ 20KB optimized
- **Icons**: ≤ 5KB SVG or optimized PNG
- **Background images**: ≤ 150KB optimized

## Network Optimization

### Resource Loading

- **Critical CSS inlined** (≤ 14KB)
- **Preload** critical fonts and images
- **Prefetch** likely next pages
- **DNS prefetch** for external domains

### Caching Strategy

- **Static assets**: 1 year cache with fingerprinting
- **API responses**: Appropriate cache headers
- **Service worker**: Cache shell and critical resources
- **CDN**: Serve static assets from edge locations

## Monitoring & Alerts

### Real User Monitoring (RUM)

```typescript
// Track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Custom GameCube metrics
trackCustomMetric('GameCube_FPS', framerate);
trackCustomMetric('Animation_Smoothness', smoothnessScore);
```

### Performance Budgets CI

- **Fail builds** if bundle size exceeds limits
- **Lighthouse CI** with performance score > 90
- **Bundle analyzer** reports on every PR
- **Core Web Vitals** monitoring in production

### Alert Thresholds

- **LCP > 3 seconds**: Critical alert
- **FID > 200ms**: Warning alert
- **Bundle size increase > 10%**: Review required
- **GameCube FPS < 45**: Performance regression
