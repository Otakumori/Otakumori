# Otaku-mori Quality Standards

## 🎯 Code Quality Gates

### Pre-Commit Checks (Automated)

All commits must pass these automated checks:

1. **TypeScript Typecheck** ✓
   - Zero TypeScript errors
   - All types properly defined
   - No `any` types without justification

2. **ESLint** ✓
   - Zero ESLint errors
   - < 50 warnings (gradually reducing)
   - Auto-fix applied where possible

3. **Prettier Format** ⚠️
   - Code formatting checked
   - Warning only (run `npm run format` to fix)

### Build Quality Gates

Before merging to `main`:

```bash
npm run quality:full
```

This runs:

- TypeScript typecheck
- ESLint validation
- Unit tests
- Security audit
- Performance budget check

---

## 📊 Performance Standards

### Core Web Vitals Targets

| Metric                         | Target  | Current |
| ------------------------------ | ------- | ------- |
| LCP (Largest Contentful Paint) | < 2.5s  | ✓       |
| FID (First Input Delay)        | < 100ms | ✓       |
| CLS (Cumulative Layout Shift)  | < 0.1   | ✓       |

### Bundle Size Budgets

| Bundle        | Limit         | Enforcement |
| ------------- | ------------- | ----------- |
| Main          | 230KB gzipped | ❌ BLOCKING |
| Route chunks  | 150KB each    | ⚠️ WARNING  |
| Total initial | 500KB gzipped | ❌ BLOCKING |

---

## 🔒 Security Standards

### Automated Scans

- `npm audit` on every build
- Dependency vulnerability scanning
- No high/critical vulnerabilities in production

### Best Practices

- All user input validated with Zod
- SQL injection prevention (Prisma ORM)
- XSS prevention (React auto-escaping)
- CSRF tokens on mutations
- Rate limiting on all API endpoints

---

## ♿ Accessibility Standards (WCAG AA+)

### Requirements

- ✓ All interactive elements keyboard accessible
- ✓ Minimum 4.5:1 color contrast ratio
- ✓ ARIA labels on all controls
- ✓ Screen reader tested
- ✓ Reduced motion support

### Testing

```bash
npm run lint:a11y
npm run verify:a11y
```

---

## 🧪 Testing Standards

### Test Coverage

| Type              | Minimum Coverage | Current     |
| ----------------- | ---------------- | ----------- |
| Unit Tests        | 60%              | In Progress |
| Integration Tests | 40%              | In Progress |
| E2E Tests         | Critical paths   | In Progress |

### Test Commands

```bash
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end (Playwright)
npm run test:coverage      # Coverage report
```

---

## 📝 Code Style Guidelines

### TypeScript

```typescript
// ✅ GOOD
interface AvatarConfig {
  height: number; // 0.8-1.3 scale
  build: number; // 0-100 (slim to muscular)
}

const getUserRole = async (userId: string): Promise<Role> => {
  // Implementation
};

// ❌ BAD
const x: any = {}; // No any without justification
function foo() {
  // Use arrow functions for consistency
  // ...
}
```

### React Components

```typescript
// ✅ GOOD - Client component with proper types
'use client';

import { useState } from 'react';

interface GameProps {
  mode: 'classic' | 'storm' | 'endless';
  onComplete: (score: number) => void;
}

export default function Game({ mode, onComplete }: GameProps) {
  const [score, setScore] = useState(0);
  // ...
}

// ❌ BAD - Missing types
export default function Game(props) {
  const [score, setScore] = useState();
  // ...
}
```

### File Organization

```
app/
  ├── (site)/           # Public pages
  ├── api/v1/           # API routes (versioned)
  ├── components/       # Shared components
  └── mini-games/       # Game pages

components/
  ├── ui/               # Reusable UI components
  ├── arcade/           # Game-specific components
  └── layout/           # Layout components

lib/
  ├── api-contracts.ts  # Zod schemas
  ├── http.ts           # HTTP wrapper
  └── db.ts             # Database singleton
```

---

## 🚀 Deployment Checklist

### Before Deploying

- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] No ESLint errors
- [ ] Security audit clean
- [ ] Performance budget met
- [ ] Accessibility verified
- [ ] Database migrations tested
- [ ] Environment variables configured

### Deployment Commands

```bash
# Preview deployment
npm run deploy:preview

# Production deployment
npm run deploy:production

# Full validation before deploy
npm run ci:validate
```

---

## 📈 Monitoring & Observability

### Error Tracking

- **Sentry**: Real-time error monitoring
- **Console errors**: Zero in production
- **API failures**: < 0.1% error rate

### Performance Monitoring

- **Google Analytics**: User behavior
- **Core Web Vitals**: Real user metrics
- **Lighthouse CI**: Automated performance audits

### Alerts

| Condition              | Action                 |
| ---------------------- | ---------------------- |
| Error rate > 1%        | Page team immediately  |
| Performance score < 85 | Investigate within 24h |
| Security vulnerability | Fix within 4h          |

---

## 🎨 Visual Quality Standards

### Game Assets

- **Resolution**: 2x for retina displays
- **Format**: WebP with fallbacks
- **Optimization**: All images < 100KB

### Animations

- **Target**: 60fps on all devices
- **Fallback**: Respect `prefers-reduced-motion`
- **Loading**: Shimmer effects, no spinners

### Dark Glass Theme

- **Background**: `#080611`
- **Accent**: `#ec4899` (sakura pink)
- **Glass**: `rgba(255, 255, 255, 0.1)` with `backdrop-blur`

---

## 🔄 Continuous Improvement

### Weekly Reviews

- Code quality metrics
- Performance trends
- User feedback
- Bug reports

### Monthly Goals

- Reduce bundle size by 5%
- Increase test coverage by 10%
- Improve accessibility score
- Optimize Core Web Vitals

---

## 📚 Resources

- [Next.js Best Practices](https://nextjs.org/docs)
- [React Patterns](https://reactpatterns.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)
- [Web.dev Performance](https://web.dev/performance)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref)

---

**Last Updated**: 2025-01-14
**Maintained by**: Otaku-mori Dev Team
