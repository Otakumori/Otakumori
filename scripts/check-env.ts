// Validate environment early in CI/build
// Uses env.mjs (t3-oss createEnv) and exits non-zero on failure
import './noop.js'; // ensure ESM context remains intact even if tree-shaken
import { env } from '../env.mjs';

// If we got here, validation passed
// Provide a concise log for CI
console.log('ENV OK:', {
  NODE_ENV: env.NODE_ENV,
  hasStripe: !!env.STRIPE_SECRET_KEY,
  hasClerk: !!env.CLERK_SECRET_KEY,
});
