import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/adults/catalog/route.safe';

// Mock environment variables
vi.mock('@/env', () => ({
  env: {
    FEATURE_ADULT_ZONE: 'true',
    FEATURE_GATED_COSMETICS: 'true',
    ADULTS_STORAGE_INDEX_URL: 'https://example.com/packs.json',
  },
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_123' }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('/api/adults/catalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 503 when feature flags are disabled', async () => {
    // Mock disabled feature flags
    vi.mocked(require('@/env').env).FEATURE_ADULT_ZONE = 'false';
    
    const request = new NextRequest('https://example.com/api/adults/catalog');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(503);
    expect(data.error).toBe('Feature not available');
  });

  it('should return 401 when user is not authenticated', async () => {
    // Mock no user
    vi.mocked(require('@clerk/nextjs/server').auth).mockResolvedValue({ userId: null });
    
    const request = new NextRequest('https://example.com/api/adults/catalog');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('should return 503 when storage is not configured', async () => {
    // Mock missing storage URL
    vi.mocked(require('@/env').env).ADULTS_STORAGE_INDEX_URL = '';
    
    const request = new NextRequest('https://example.com/api/adults/catalog');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(503);
    expect(data.error).toBe('Storage not configured');
  });

  it('should return packs when everything is configured correctly', async () => {
    // Mock successful fetch
    const mockPacks = [
      {
        slug: 'test_pack',
        title: 'Test Pack',
        rarity: 'rare',
        type: 'outfit',
        isAdultOnly: true,
        pricePetals: 1000,
        priceUsdCents: 999,
        physicsProfile: {
          id: 'standard',
          softBody: { enable: false },
          clothSim: { enable: false },
        },
        interactions: [],
        materials: {
          shader: 'AnimeToon',
          params: { glossStrength: 0.6, rimStrength: 0.35 },
        },
        layers: ['outfit'],
        assets: { albedo: 'https://example.com/test.jpg' },
        sliders: [],
      },
    ];
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPacks),
    } as Response);
    
    const request = new NextRequest('https://example.com/api/adults/catalog');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.data.packs).toHaveLength(1);
    expect(data.data.packs[0].slug).toBe('test_pack');
    expect(data.requestId).toMatch(/^otm_\d+_[a-z0-9]+$/);
  });

  it('should filter packs based on region and preferences', async () => {
    const mockPacks = [
      {
        slug: 'us_only_pack',
        title: 'US Only Pack',
        rarity: 'rare',
        type: 'outfit',
        isAdultOnly: true,
        regionAllowlist: ['us'],
        pricePetals: 1000,
        priceUsdCents: 999,
        physicsProfile: { id: 'standard', softBody: { enable: false }, clothSim: { enable: false } },
        interactions: [],
        materials: { shader: 'AnimeToon', params: { glossStrength: 0.6, rimStrength: 0.35 } },
        layers: ['outfit'],
        assets: { albedo: 'https://example.com/test.jpg' },
        sliders: [],
      },
      {
        slug: 'global_pack',
        title: 'Global Pack',
        rarity: 'rare',
        type: 'outfit',
        isAdultOnly: true,
        pricePetals: 1000,
        priceUsdCents: 999,
        physicsProfile: { id: 'standard', softBody: { enable: false }, clothSim: { enable: false } },
        interactions: [],
        materials: { shader: 'AnimeToon', params: { glossStrength: 0.6, rimStrength: 0.35 } },
        layers: ['outfit'],
        assets: { albedo: 'https://example.com/test.jpg' },
        sliders: [],
      },
    ];
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPacks),
    } as Response);
    
    // Mock US region
    const request = new NextRequest('https://example.com/api/adults/catalog', {
      headers: { 'cf-ipcountry': 'US' },
    });
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data.packs).toHaveLength(2); // Both packs should be visible in US
    expect(data.data.region).toBe('us');
  });
});
