type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

function readRuntimeEnvironment(): RuntimeEnvironment {
  return typeof globalThis.process === 'undefined' ? {} : globalThis.process.env;
}

export const PREVIEW_EXTERNAL_MUTATION_ERROR = 'PREVIEW_EXTERNAL_MUTATION_DISABLED';
export const PREVIEW_DATABASE_ISOLATION_ERROR = 'PREVIEW_DATABASE_ISOLATION_REQUIRED';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const EXTERNAL_MUTATION_PREFIXES = [
  '/api/admin/cache',
  '/api/admin/media',
  '/api/admin/merchize',
  '/api/admin/music/blob-upload-token',
  '/api/admin/orders',
  '/api/admin/printify',
  '/api/clerk/webhook',
  '/api/cron',
  '/api/inngest',
  '/api/reviews/upload',
  '/api/storage',
  '/api/stripe/webhook',
  '/api/test-inngest',
  '/api/v1/avatar/export',
  '/api/v1/avatar/generate-sprites',
  '/api/v1/printify',
  '/api/v1/sync-external',
  '/api/webhooks',
];

export function isVercelPreview(
  environment: RuntimeEnvironment = readRuntimeEnvironment(),
): boolean {
  return environment.VERCEL === '1' && environment.VERCEL_ENV === 'preview';
}

export function isPreviewExternalMutationRequest(
  pathname: string,
  method: string,
  environment: RuntimeEnvironment = readRuntimeEnvironment(),
): boolean {
  if (!isVercelPreview(environment) || !MUTATION_METHODS.has(method.toUpperCase())) return false;
  return EXTERNAL_MUTATION_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function assertExternalMutationAllowed(
  capability: string,
  environment: RuntimeEnvironment = readRuntimeEnvironment(),
): void {
  if (!isVercelPreview(environment)) return;
  throw new Error(`${PREVIEW_EXTERNAL_MUTATION_ERROR}:${capability}`);
}

function databaseIdentity(value: string) {
  const parsed = new URL(value);
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error(PREVIEW_DATABASE_ISOLATION_ERROR);
  }

  return {
    host: parsed.hostname.toLowerCase().replace(/-pooler(?=\.)/, ''),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '').split('/')[0] ?? ''),
  };
}

export function assertPreviewDatabaseIsolation(
  environment: RuntimeEnvironment = readRuntimeEnvironment(),
): void {
  if (!isVercelPreview(environment)) return;

  const pooled = environment.DATABASE_URL;
  const unpooled = environment.DATABASE_URL_UNPOOLED;
  if (!pooled || !unpooled) throw new Error(PREVIEW_DATABASE_ISOLATION_ERROR);

  try {
    const pooledIdentity = databaseIdentity(pooled);
    const unpooledIdentity = databaseIdentity(unpooled);
    if (
      pooledIdentity.host !== unpooledIdentity.host ||
      pooledIdentity.database !== 'neondb' ||
      unpooledIdentity.database !== 'neondb'
    ) {
      throw new Error(PREVIEW_DATABASE_ISOLATION_ERROR);
    }
  } catch {
    throw new Error(PREVIEW_DATABASE_ISOLATION_ERROR);
  }
}
