import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findAssignment: vi.fn(),
  updateAssignment: vi.fn(),
  findUser: vi.fn(),
  grantPetals: vi.fn(),
  awardStreak: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@/lib/db', () => ({
  db: {
    questAssignment: {
      findUnique: mocks.findAssignment,
      updateMany: mocks.updateAssignment,
    },
    user: { findUnique: mocks.findUser },
  },
}));
vi.mock('@/app/lib/petals/grant', () => ({ grantPetals: mocks.grantPetals }));
vi.mock('@/app/lib/quests/server', () => ({
  awardStreakShardIfEligible: mocks.awardStreak,
  userDayNY: () => '2026-10-23',
}));
vi.mock('@/app/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { POST } from '@/app/api/quests/claim/route';

const assignment = {
  id: 'assignment_1',
  userId: 'user_1',
  day: '2026-10-23',
  completedAt: new Date(),
  claimedAt: null,
  bonusEligible: true,
  Quest: { key: 'quest_1', title: 'Quest One', basePetals: 10, bonusPetals: 5 },
};

const success = {
  success: true,
  granted: 15,
  newBalance: 115,
  lifetimeEarned: 215,
  dailyRemaining: 485,
  duplicate: false,
};

const claimRequest = () =>
  new Request('https://example.com/api/quests/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignmentId: 'assignment_1' }),
  });

describe('quest claim transaction truth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ userId: 'clerk_1' });
    mocks.findAssignment.mockResolvedValue({ ...assignment });
    mocks.findUser.mockResolvedValue({ id: 'user_1', petalBalance: 100 });
    mocks.grantPetals.mockResolvedValue({ ...success });
    mocks.updateAssignment.mockResolvedValue({ count: 1 });
    mocks.awardStreak.mockResolvedValue(false);
  });

  it('persists the authorized reward before consuming the first claim', async () => {
    const response = await POST(claimRequest());
    expect(response.status).toBe(200);
    expect(mocks.grantPetals).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_1',
        amount: 15,
        source: 'quest_reward',
        idempotencyKey: 'quest_assignment:assignment_1',
      }),
    );
    expect(mocks.updateAssignment).toHaveBeenCalledWith({
      where: { id: 'assignment_1', claimedAt: null },
      data: { claimedAt: expect.any(Date) },
    });
    expect((await response.json()).petalsGranted).toBe(15);
  });

  it('does not grant an already claimed assignment', async () => {
    mocks.findAssignment.mockResolvedValue({ ...assignment, claimedAt: new Date() });
    const response = await POST(claimRequest());
    expect(response.status).toBe(200);
    expect((await response.json()).already).toBe(true);
    expect(mocks.grantPetals).not.toHaveBeenCalled();
  });

  it('uses one idempotent reward across concurrent claim attempts', async () => {
    mocks.grantPetals
      .mockResolvedValueOnce({ ...success })
      .mockResolvedValueOnce({ ...success, granted: 0, duplicate: true });
    mocks.updateAssignment.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });

    const responses = await Promise.all([POST(claimRequest()), POST(claimRequest())]);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(mocks.grantPetals).toHaveBeenCalledTimes(2);
    expect(mocks.grantPetals.mock.calls[0]?.[0].idempotencyKey).toBe(
      mocks.grantPetals.mock.calls[1]?.[0].idempotencyKey,
    );
  });

  it('does not consume the claim or report petals when reward persistence fails', async () => {
    mocks.grantPetals.mockResolvedValue({
      success: false,
      granted: 0,
      newBalance: 100,
      lifetimeEarned: 200,
      errorCode: 'INTERNAL_ERROR',
    });
    const response = await POST(claimRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'reward_failed', code: 'INTERNAL_ERROR' });
    expect(mocks.updateAssignment).not.toHaveBeenCalled();
    expect(mocks.awardStreak).not.toHaveBeenCalled();
  });

  it('does not consume a claim when the database-backed source cap is reached', async () => {
    mocks.grantPetals.mockResolvedValue({
      success: true,
      granted: 0,
      newBalance: 100,
      lifetimeEarned: 200,
      limited: true,
      dailyRemaining: 0,
      duplicate: false,
    });
    const response = await POST(claimRequest());
    expect(response.status).toBe(429);
    expect((await response.json()).error).toBe('daily_cap_reached');
    expect(mocks.updateAssignment).not.toHaveBeenCalled();
  });

  it('requires no Redis fallback and succeeds through centralized cap authority', async () => {
    const response = await POST(claimRequest());
    expect(response.status).toBe(200);
    expect(mocks.grantPetals).toHaveBeenCalledOnce();
  });

  it('allows a safe retry after a failed reward', async () => {
    mocks.grantPetals
      .mockResolvedValueOnce({
        success: false,
        granted: 0,
        newBalance: 100,
        lifetimeEarned: 200,
        errorCode: 'SCHEMA_UNAVAILABLE',
      })
      .mockResolvedValueOnce({ ...success });

    expect((await POST(claimRequest())).status).toBe(503);
    expect((await POST(claimRequest())).status).toBe(200);
    expect(mocks.updateAssignment).toHaveBeenCalledTimes(1);
  });
});
