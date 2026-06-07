import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('OrderStatus schema compatibility', () => {
  it('keeps historical migration values represented in the Prisma schema', () => {
    const schema = fs.readFileSync(path.join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');
    const historicalMigration = fs.readFileSync(
      path.join(
        process.cwd(),
        'prisma',
        'migrations',
        '20250126000000_enhance_orders_and_petals',
        'migration.sql',
      ),
      'utf8',
    );

    for (const status of ['paid', 'failed', 'refunded']) {
      expect(historicalMigration).toContain(`'${status}'`);
      expect(schema).toMatch(new RegExp(`\\n\\s+${status}\\s*\\n`));
    }
  });
});
