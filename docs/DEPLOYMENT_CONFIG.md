# Otaku-mori Deployment Configuration

## Production Domain

**Primary Domain**: www.otaku-mori.com

## Environment Configuration

### Inngest Configuration

Production Inngest configuration should use the primary domain:

```bash
INNGEST_SERVE_URL=https://www.otaku-mori.com/api/inngest
```

Development configuration:

```bash
INNGEST_SERVE_URL=http://localhost:3000/api/inngest
```

## API Endpoints

All API routes are versioned under `/api/v1/*`

Production base URL: `https://www.otaku-mori.com/api/v1`

## Webhook Endpoints

- **Inngest**: `https://www.otaku-mori.com/api/inngest`
- **Clerk**: `https://www.otaku-mori.com/api/webhooks/clerk`
- **Printify**: `https://www.otaku-mori.com/api/webhooks/printify`
- **Stripe**: `https://www.otaku-mori.com/api/webhooks/stripe`

## Environment Variables

See `.env.example` for complete list of required environment variables.

Critical production variables:

- `NEXT_PUBLIC_APP_URL=https://www.otaku-mori.com`
- `INNGEST_SERVE_URL=https://www.otaku-mori.com/api/inngest`
- `CLERK_WEBHOOK_URL=https://www.otaku-mori.com/api/webhooks/clerk`

## Performance Standards

- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size**: Main < 230KB gzipped, Total initial < 500KB gzipped
- **WebGL Performance**: Auto-detects device tier (High/Medium/Low/Unsupported)

## Asset Optimization

Run asset validation before deployment:

```bash
npm run assets:validate
```

Validates all images, audio, and 3D models against quality standards.

---

**Last Updated**: 2025-01-14
**Maintained by**: Otaku-mori Dev Team
