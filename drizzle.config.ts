import { type Config } from 'drizzle-kit';

import { env } from './app/lib/env';

export default {
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL || 'postgresql://localhost:5432/otakumori',
  },
  tablesFilter: ['Otaku-mori_*'],
} satisfies Config;
