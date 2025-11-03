import { env } from '@/env';

export interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
  details: Record<string, { value: string | undefined; status: 'valid' | 'missing' | 'warning' }>;
}

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'PRINTIFY_API_KEY',
  'PRINTIFY_SHOP_ID',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
] as const;

const RECOMMENDED_ENV_VARS = [
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL',
] as const;

const URL_ENV_VARS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SITE_URL'] as const;
const API_KEY_ENV_VARS = ['PRINTIFY_API_KEY', 'CLERK_SECRET_KEY', 'STRIPE_SECRET_KEY'] as const;

export function validateEnvironment(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    missing: [],
    warnings: [],
    details: {},
  };

  for (const key of REQUIRED_ENV_VARS) {
    const value = env[key];
    if (!value) {
      result.isValid = false;
      result.missing.push(key);
      result.details[key] = { value: undefined, status: 'missing' };
      continue;
    }

    result.details[key] = { value: String(value), status: 'valid' };
  }

  for (const key of RECOMMENDED_ENV_VARS) {
    const value = env[key];
    if (!value) {
      result.warnings.push(`${key} is unset`);
      result.details[key] = { value: undefined, status: 'warning' };
      continue;
    }

    result.details[key] = { value: String(value), status: 'valid' };
  }

  for (const key of URL_ENV_VARS) {
    const value = env[key];
    if (value && !isValidUrl(value)) {
      result.warnings.push(`${key} contains an invalid URL value`);
      result.details[key] = { value: String(value), status: 'warning' };
    }
  }

  for (const key of API_KEY_ENV_VARS) {
    const value = env[key];
    if (value && value.length < 10) {
      result.warnings.push(`${key} appears to be shorter than expected`);
      result.details[key] = { value: String(value), status: 'warning' };
    }
  }

  return result;
}

function isValidUrl(candidate: string): boolean {
  try {
    new URL(candidate);
    return true;
  } catch {
    return false;
  }
}

export function logEnvironmentStatus(): void {
  const validation = validateEnvironment();

  console.warn('\nEnvironment Validation Report');
  console.warn('=============================');

  if (validation.isValid) {
    console.warn('All required environment variables are set ✅');
  } else {
    console.error('Missing required environment variables:');
    validation.missing.forEach((key) => console.error(`  • ${key}`));
  }

  if (validation.warnings.length > 0) {
    console.warn('\nWarnings:');
    validation.warnings.forEach((warning) => console.warn(`  • ${warning}`));
  }

  console.warn('\nEnvironment Details:');
  Object.entries(validation.details).forEach(([key, detail]) => {
    const statusLabel =
      detail.status === 'valid' ? '[OK]' : detail.status === 'missing' ? '[MISSING]' : '[WARNING]';
    const preview = detail.value ? detail.value.substring(0, 60) : 'undefined';
    console.warn(`  ${statusLabel} ${key}: ${preview}`);
  });

  console.warn('');
}
