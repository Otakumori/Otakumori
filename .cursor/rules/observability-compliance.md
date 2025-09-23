# Observability & Compliance Standards

## Google Analytics 4 (GA4) Integration

### Event Tracking Standards

```typescript
// Standard event structure
gtag('event', 'action_name', {
  event_category: 'category',
  event_label: 'label',
  value: number,
  custom_parameter: 'value',
});
```

### Core Events to Track

- **Page views**: Automatic via Next.js router
- **Game sessions**: Start, completion, score submission
- **Auth events**: Sign-in, sign-up, sign-out
- **Commerce**: Add to cart, purchase, wishlist
- **Engagement**: Scroll depth, time on page, clicks

### Feature Tag Implementation

```typescript
// Tag events with features for A/B testing
gtag('event', 'game_start', {
  game_id: 'samurai-petal-slice',
  feature_flag: 'new_scoring_v2',
  user_cohort: 'power_users',
});
```

### Custom Dimensions

- User role (user/moderator/admin)
- Game completion status
- Feature flag assignments
- Device type and capabilities

## Sentry Error Monitoring

### Error Categories

- **JavaScript errors**: Runtime exceptions and promise rejections
- **API errors**: Failed requests and validation errors
- **Performance issues**: Slow transactions and memory leaks
- **User experience**: Failed user flows and interactions

### Context Enrichment

```typescript
Sentry.setContext('game_session', {
  game_id: 'memory-match',
  level: 3,
  score: 1250,
  time_played: 120,
});

Sentry.setTag('feature_flag', 'new_ui_v3');
Sentry.setLevel('error');
```

### Release Tracking

- **Deploy tracking**: Automatic release creation
- **Feature rollout**: Track feature adoption rates
- **Performance regression**: Compare release performance
- **Error spike detection**: Alert on error rate increases

## Privacy & PII Protection

### Data Classification

- **Public**: Game scores, public profile info
- **Private**: Email, payment info, private messages
- **Sensitive**: Authentication tokens, API keys
- **Anonymous**: Usage analytics, performance metrics

### PII Scrubbing

```typescript
// Automatically scrub PII from logs
const sanitizeForLogging = (data: any) => {
  return {
    ...data,
    email: data.email ? '[REDACTED]' : undefined,
    userId: data.userId ? hashUserId(data.userId) : undefined,
  };
};
```

### GDPR Compliance

- **Data minimization**: Collect only necessary data
- **Consent management**: Cookie preferences and opt-outs
- **Right to deletion**: User data removal endpoints
- **Data portability**: Export user data functionality

## Logging Standards

### Log Levels

- **ERROR**: System errors, API failures, security events
- **WARN**: Performance issues, deprecated feature usage
- **INFO**: User actions, system state changes
- **DEBUG**: Detailed application flow (dev only)

### Structured Logging

```typescript
logger.info('game_completed', {
  userId: hashUserId(userId),
  gameId: 'petal-storm-rhythm',
  score: 2450,
  duration: 180,
  timestamp: Date.now(),
  sessionId: sessionId,
});
```

### Log Retention

- **Error logs**: 90 days
- **Access logs**: 30 days
- **Analytics events**: 14 months (GA4 default)
- **Debug logs**: 7 days (production), unlimited (dev)

## Security Monitoring

### Threat Detection

- **Authentication attacks**: Failed login attempts
- **Rate limiting**: API abuse detection
- **Data exfiltration**: Unusual data access patterns
- **Injection attempts**: SQL, XSS, command injection

### Incident Response

- **Automated alerts**: Critical security events
- **Escalation procedures**: Security team notification
- **Forensic logging**: Detailed audit trails
- **Recovery procedures**: System restoration plans
