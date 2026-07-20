import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const clerkProxyDir = path.join(repoRoot, 'app', 'api', 'clerk-proxy');
const apiDir = path.join(repoRoot, 'app', 'api');

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];

  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      return walkFiles(fullPath);
    }
    return [fullPath];
  });
}

function appApiSource() {
  return walkFiles(apiDir)
    .filter((file) => /\.(ts|tsx|js|jsx)$/.test(file))
    .map((file) => ({
      file,
      source: readFileSync(file, 'utf8'),
    }));
}

describe('Clerk Backend API proxy removal', () => {
  it('removes the client-accessible catch-all Clerk proxy route', () => {
    expect(walkFiles(clerkProxyDir).filter((file) => /route\.(ts|tsx|js|jsx)$/.test(file))).toEqual(
      [],
    );
  });

  it.each(['users', 'sessions', 'organizations', 'invitations', 'metadata'])(
    'does not leave a route handler that can forward arbitrary %s paths',
    (segment) => {
      const routePath = path.join(clerkProxyDir, '[...path]', 'route.ts');

      expect(existsSync(routePath)).toBe(false);
      expect(existsSync(path.join(clerkProxyDir, segment, 'route.ts'))).toBe(false);
    },
  );

  it('does not leave generic Clerk Backend API forwarding code in app API routes', () => {
    const forbiddenPatterns = [
      /api\.clerk\.com\/v1\/\$\{path\}/,
      /Authorization:\s*`Bearer\s+\$\{env\.CLERK_SECRET_KEY\}`/,
      /params:\s*\{\s*path:\s*string\[\]\s*\}/,
      /Failed to fetch from Clerk API/,
      /Failed to post to Clerk API/,
    ];

    const offenders = appApiSource().flatMap(({ file, source }) =>
      forbiddenPatterns
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${path.relative(repoRoot, file)} matched ${pattern}`),
    );

    expect(offenders).toEqual([]);
  });

  it('does not leave a route that can reflect arbitrary query params, request bodies, or Clerk errors', () => {
    const proxySources = appApiSource().filter(({ file, source }) => {
      const normalized = file.split(path.sep).join('/');
      return normalized.includes('/app/api/clerk-proxy/') || source.includes('Clerk proxy error');
    });

    expect(proxySources).toEqual([]);
  });
});
