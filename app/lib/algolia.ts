import { algoliasearch } from 'algoliasearch';
import { env } from '@/env.mjs';

// Only initialize if environment variables are available
let client: any = null;
let idxBlog: any = null;
let idxGames: any = null;
let idxPages: any = null;

if (env.NEXT_PUBLIC_ALGOLIA_APP_ID && env.ALGOLIA_ADMIN_API_KEY) {
  client = algoliasearch(env.NEXT_PUBLIC_ALGOLIA_APP_ID, env.ALGOLIA_ADMIN_API_KEY);

  if (env.ALGOLIA_INDEX_BLOG) idxBlog = client.initIndex(env.ALGOLIA_INDEX_BLOG);
  if (env.ALGOLIA_INDEX_GAMES) idxGames = client.initIndex(env.ALGOLIA_INDEX_GAMES);
  if (env.ALGOLIA_INDEX_PAGES) idxPages = client.initIndex(env.ALGOLIA_INDEX_PAGES);
}

export { idxBlog, idxGames, idxPages };
