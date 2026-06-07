import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ADMIN_ROUTE_ROOT = path.join(process.cwd(), 'app', 'api', 'admin');
const SHARED_AUTH_IMPORTS = [
  "'@/app/lib/auth/admin'",
  "'@/app/lib/authz'",
  "'@/lib/adminGuard'",
];

function routeFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return routeFiles(target);
    return entry.name === 'route.ts' ? [target] : [];
  });
}

describe('admin API authorization coverage', () => {
  it('requires every admin API route to use the shared authorization system', () => {
    const uncovered = routeFiles(ADMIN_ROUTE_ROOT)
      .filter((file) => {
        const source = fs.readFileSync(file, 'utf8');
        return !SHARED_AUTH_IMPORTS.some((moduleName) => source.includes(moduleName));
      })
      .map((file) => path.relative(process.cwd(), file));

    expect(uncovered).toEqual([]);
  });

  it('keeps automation routes on the explicit internal-service policy', () => {
    const internalRoutes = [
      'backup/route.ts',
      'cache/clear/route.ts',
      'maintenance/route.ts',
      'notifications/route.ts',
    ];

    for (const route of internalRoutes) {
      const source = fs.readFileSync(path.join(ADMIN_ROUTE_ROOT, route), 'utf8');
      expect(source).toContain("'internal_service'");
    }
  });
});
