import { env } from '@/env.mjs';

export interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
  details: Record<string, { value: string | undefined; status: 'valid' | 'missing' | 'warning' }>;
}

export function validateEnvironment(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    missing: [],
    warnings: [],
    details: {},
  };

  // Required environment variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'PRINTIFY_API_KEY',
    'PRINTIFY_SHOP_ID',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
  ];

  // Optional but recommended
  const recommended = [
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_WEBHOOK_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_SITE_URL',
  ];

  // Check required variables
  required.forEach(key => {
    const value = env[key as keyof typeof env];
    if (!value) {
      result.isValid = false;
      result.missing.push(key);
      result.details[key] = { value: undefined, status: 'missing' };
    } else {
      result.details[key] = { value: String(value), status: 'valid' };
    }
  });

  // Check recommended variables
  recommended.forEach(key => {
    const value = env[key as keyof typeof env];
    if (!value) {
      result.warnings.push(key);
      result.details[key] = { value: undefined, status: 'warning' };
    } else {
      result.details[key] = { value: String(value), status: 'valid' };
    }
  });

  // Special validation for URLs
  const urlKeys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SITE_URL'];
  urlKeys.forEach(key => {
    const value = env[key as keyof typeof env];
    if (value && !isValidUrl(value)) {
      result.warnings.push(`${key} (invalid URL format)`);
      result.details[key] = { value: String(value), status: 'warning' };
    }
  });

  // Special validation for API keys
  const apiKeyKeys = ['PRINTIFY_API_KEY', 'CLERK_SECRET_KEY', 'STRIPE_SECRET_KEY'];
  apiKeyKeys.forEach(key => {
    const value = env[key as keyof typeof env];
    if (value && value.length < 10) {
      result.warnings.push(`${key} (suspiciously short)`);
      result.details[key] = { value: String(value), status: 'warning' };
    }
  });

  return result;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function logEnvironmentStatus(): void {
  const validation = validateEnvironment();
  
  console.log('\n🔍 Environment Validation Report');
  console.log('================================');
  
  if (validation.isValid) {
    console.log('✅ All required environment variables are set');
  } else {
    console.log('❌ Missing required environment variables:');
    validation.missing.forEach(key => {
      console.log(`   - ${key}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
  }
  
  console.log('\n📋 Environment Details:');
  Object.entries(validation.details).forEach(([key, detail]) => {
    const status = detail.status === 'valid' ? '✅' : detail.status === 'missing' ? '❌' : '⚠️';
    const value = detail.value ? `${detail.value.substring(0, 20)}...` : 'undefined';
    console.log(`   ${status} ${key}: ${value}`);
  });
  
  console.log('\n');
}
