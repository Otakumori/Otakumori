import { createClient, type ClientConfig } from '@sanity/client';
import { env } from '@/env.mjs';

type SanityClient = ReturnType<typeof createClient>;

let client: SanityClient | null = null;

export function isSanityConfigured(): boolean {
  return Boolean(env.SANITY_PROJECT_ID && env.SANITY_DATASET && env.SANITY_READ_TOKEN);
}

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured()) {
    return null;
  }

  if (client) {
    return client;
  }

  const config: ClientConfig = {
    projectId: env.SANITY_PROJECT_ID!,
    dataset: env.SANITY_DATASET!,
    apiVersion: env.SANITY_API_VERSION || '2025-01-01',
    useCdn: env.NODE_ENV === 'production',
    token: env.SANITY_READ_TOKEN,
    perspective: 'published',
  };

  client = createClient(config);
  return client;
}
