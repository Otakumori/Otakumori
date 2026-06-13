import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@src': path.resolve(__dirname, 'src'),
      'server-only': path.resolve(__dirname, 'tests/shims/server-only.ts'),
      '@om/avatar': path.resolve(__dirname, 'packages/avatar/src'),
      '@om/ecs': path.resolve(__dirname, 'packages/ecs/src'),
      '@om/game-kit': path.resolve(__dirname, 'packages/game-kit/src'),
      '@om/shaders': path.resolve(__dirname, 'packages/shaders/src'),
      '@om': path.resolve(__dirname, 'packages'),
    },
  },
  test: {
    environment: 'jsdom',
    include: [
      '__tests__/**/*.{test,spec}.{ts,tsx}',
      'app/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'packages/**/__tests__/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      'tests/e2e/**',
      'e2e/**',
      '**/*.e2e.{test,spec}.{ts,tsx}',
      '**/*.playwright.{test,spec}.{ts,tsx}',
      '**/*.safe.spec.ts',
      '**/*.disabled.safe.*',
    ],
    setupFiles: ['./vitest.setup.ts', './__tests__/setup.ts'],
    deps: {
      inline: [/^(?!@?vitest).*/],
    },
  },
});
