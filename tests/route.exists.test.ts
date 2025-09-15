import { describe, it, expect } from 'vitest';

// Add routes here as you create them
const ROUTES = [
  '@/app/api/health/route',
  '@/app/api/printify/products/route',
  // Add more routes as they're created
];

describe('API route modules exist & export GET/POST', () => {
  for (const p of ROUTES) {
    it(p, async () => {
      const mod = await import(p);
      expect(mod.GET || mod.POST).toBeTypeOf('function');
    });
  }
});
