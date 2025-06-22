'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const env_1 = require('~/env');
exports.default = {
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env_1.env.DATABASE_URL,
  },
  tablesFilter: ['Otaku-mori_*'],
};
