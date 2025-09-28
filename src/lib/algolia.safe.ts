import { algoliasearch } from 'algoliasearch';
import { env } from '@/env';

export function getAlgolia() {
  const appId = (env as any).NEXT_PUBLIC_ALGOLIA_APP_ID;
  const admin = (env as any).ALGOLIA_ADMIN_API_KEY;
  if (!appId || !admin) return null;
  const client: any = algoliasearch(appId, admin);
  return {
    client,
    blog: client.initIndex((env as any).ALGOLIA_INDEX_BLOG || 'om_blog'),
    games: client.initIndex((env as any).ALGOLIA_INDEX_GAMES || 'om_games'),
    pages: client.initIndex((env as any).ALGOLIA_INDEX_PAGES || 'om_pages'),
  };
}
