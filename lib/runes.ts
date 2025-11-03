import { db } from '@/lib/db';
import {
  BURST_THRESHOLDS,
  DEFAULT_RUNE_LORE,
  type CanonicalRuneId,
  type PetalGrantResult,
  type RewardsConfig,
  type RuneComboDef,
  type RuneDef,
} from '@/types/runes';

/**
 * Map UPCs to runes based on configuration
 */
export async function mapUPCsToRunes(upcs: string[]): Promise<CanonicalRuneId[]> {
  const siteConfig = await db.siteConfig.findUnique({
    where: { id: 'singleton' },
  });

  if (!siteConfig) return [];

  const runesConfig = siteConfig.runes as any;
  const runeDefs = runesConfig?.defs || [];

  const mappedRunes: CanonicalRuneId[] = [];
  const unmappedUPCs: string[] = [];

  // Map UPCs to known runes
  for (const upc of upcs) {
    const runeDef = runeDefs.find((r: RuneDef) => r.isActive && r.printifyUPCs?.includes(upc));

    if (runeDef) {
      mappedRunes.push(runeDef.canonicalId);
    } else {
      unmappedUPCs.push(upc);
    }
  }

  // Handle unmapped UPCs with gacha if enabled
  if (runesConfig?.gacha?.enabled && unmappedUPCs.length > 0) {
    const availableRunes = await getAvailableRunesForGacha();

    for (const upc of unmappedUPCs) {
      if (availableRunes.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableRunes.length);
        const selectedRune = availableRunes[randomIndex];
        if (!selectedRune) {
          continue;
        }

        // Assign this UPC to the selected rune permanently
        await assignUPCToRune(upc, selectedRune.canonicalId);
        mappedRunes.push(selectedRune.canonicalId);

        // Remove from available pool
        availableRunes.splice(randomIndex, 1);
      }
    }
  }

  return mappedRunes;
}

/**
 * Get runes available for gacha assignment
 */
async function getAvailableRunesForGacha(): Promise<RuneDef[]> {
  const siteConfig = await db.siteConfig.findUnique({
    where: { id: 'singleton' },
  });

  if (!siteConfig) return [];

  const runesConfig = siteConfig.runes as any;
  const runeDefs = runesConfig?.defs || [];

  // Return runes that have no UPCs assigned yet
  return runeDefs.filter(
    (r: RuneDef) => r.isActive && (!r.printifyUPCs || r.printifyUPCs.length === 0),
  );
}

/**
 * Assign a UPC to a rune permanently
 */
async function assignUPCToRune(upc: string, runeId: CanonicalRuneId): Promise<void> {
  const runeDef = await db.runeDef.findUnique({
    where: { canonicalId: runeId },
  });

  if (runeDef) {
    const updatedUPCs = [...(runeDef.printifyUPCs || []), upc];

    await db.runeDef.update({
      where: { id: runeDef.id },
      data: { printifyUPCs: updatedUPCs },
    });
  }
}

/**
 * Grant petals for an order with rune mapping
 */
export async function grantPetalsForOrder({
  userId,
  stripeId,
  subtotalCents,
  lineItems,
}: {
  userId: string;
  stripeId: string;
  subtotalCents: number;
  lineItems: Array<{ upc?: string; quantity: number; unitAmount: number }>;
}): Promise<PetalGrantResult> {
  // Check if order already processed (idempotency)
  const existingOrder = await db.order.findUnique({
    where: { stripeId },
  });

  if (existingOrder && existingOrder.petalsAwarded > 0) {
    // Return existing result
    const userRunes = await db.userRune.findMany({
      where: { orderId: existingOrder.id },
      include: { RuneDef: true },
    });

    return {
      granted: existingOrder.petalsAwarded,
      flags: {
        firstPurchase: false,
        hitSoftCap: false,
        hitHardCap: false,
        streakBonus: false,
      },
      burst: {
        size: 'none',
        amountGrantedNow: 0,
      },
      newTotal: 0, // Will be calculated below
      runes: userRunes.map((ur) => ur.RuneDef.canonicalId as CanonicalRuneId),
      combos: [],
    };
  }

  // Get site configuration
  const siteConfig = (await db.siteConfig.findUnique({
    where: { id: 'singleton' },
  })) || {
    rewards: {
      baseRateCents: 300,
      minPerOrder: 5,
      maxPerOrder: 120,
      streak: { enabled: true, dailyBonusPct: 0.05, maxPct: 0.25 },
      seasonal: { multiplier: 1.0 },
      daily: { softCap: 200, postSoftRatePct: 0.5, hardCap: 400 },
      firstPurchaseBonus: 20,
    },
  };

  const rewardsConfig = siteConfig.rewards as RewardsConfig;

  // Calculate base petals
  let rawPetals = Math.ceil(subtotalCents / rewardsConfig.baseRateCents);

  // Apply seasonal multiplier
  rawPetals = Math.round(rawPetals * rewardsConfig.seasonal.multiplier);

  // Check if this is the user's first purchase
  const isFirstPurchase = !(await db.order.findFirst({
    where: { userId, status: 'pending' },
  }));

  if (isFirstPurchase) {
    rawPetals += rewardsConfig.firstPurchaseBonus;
  }

  // Apply streak bonus if enabled
  let streakBonus = 0;
  if (rewardsConfig.streak.enabled) {
    const streakDays = await calculateStreakDays(userId);
    const streakMultiplier = Math.min(
      streakDays * rewardsConfig.streak.dailyBonusPct,
      rewardsConfig.streak.maxPct,
    );
    streakBonus = Math.round(rawPetals * streakMultiplier);
  }

  rawPetals += streakBonus;

  // Clamp to order limits
  rawPetals = Math.max(rewardsConfig.minPerOrder, Math.min(rewardsConfig.maxPerOrder, rawPetals));

  // Apply daily caps
  const dailyResult = await applyDailyCaps(userId, rawPetals, rewardsConfig);
  const finalPetals = dailyResult.granted;

  // Map UPCs to runes
  const upcs = lineItems
    .filter((item) => item.upc)
    .map((item) => item.upc!)
    .filter((upc, index, arr) => arr.indexOf(upc) === index); // Remove duplicates

  const runes = await mapUPCsToRunes(upcs);

  // Check for combo completions
  const combos = await checkComboCompletions(userId, runes);

  // Determine burst size
  const burstSize =
    finalPetals >= BURST_THRESHOLDS.large
      ? 'large'
      : finalPetals >= BURST_THRESHOLDS.medium
        ? 'medium'
        : finalPetals >= BURST_THRESHOLDS.small
          ? 'small'
          : 'none';

  // Get user's new total
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, petalBalance: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const newTotal = user.petalBalance + finalPetals;

  return {
    granted: finalPetals,
    flags: {
      firstPurchase: isFirstPurchase,
      hitSoftCap: dailyResult.hitSoftCap,
      hitHardCap: dailyResult.hitHardCap,
      streakBonus: streakBonus > 0,
    },
    burst: {
      size: burstSize,
      amountGrantedNow: finalPetals,
    },
    newTotal,
    runes,
    combos,
  };
}

/**
 * Calculate user's current streak days
 */
async function calculateStreakDays(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streakDays = 0;
  let currentDate = today;

  while (true) {
    const order = await db.order.findFirst({
      where: {
        userId,
        status: 'pending',
        paidAt: {
          gte: currentDate,
          lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (order) {
      streakDays++;
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streakDays;
}

/**
 * Apply daily caps to petal grant
 */
async function applyDailyCaps(
  userId: string,
  requestedPetals: number,
  rewardsConfig: RewardsConfig,
): Promise<{ granted: number; hitSoftCap: boolean; hitHardCap: boolean }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get today's petal events
  const todayEvents = await db.petalLedger.findMany({
    where: {
      userId,
      type: { in: ['earn', 'purchase_bonus', 'first_purchase_bonus', 'milestone_bonus'] },
      createdAt: { gte: today },
    },
  });

  const todayTotal = todayEvents.reduce((sum, event) => sum + event.amount, 0);

  let granted = requestedPetals;
  let hitSoftCap = false;
  let hitHardCap = false;

  // Check soft cap
  if (todayTotal >= rewardsConfig.daily.softCap) {
    hitSoftCap = true;
    const remainingSoft = Math.max(0, rewardsConfig.daily.softCap - todayTotal);
    const postSoftRequested = Math.max(0, requestedPetals - remainingSoft);

    // Apply reduced rate after soft cap
    const postSoftGranted = Math.round(postSoftRequested * rewardsConfig.daily.postSoftRatePct);
    granted = remainingSoft + postSoftGranted;
  }

  // Check hard cap
  if (todayTotal + granted > rewardsConfig.daily.hardCap) {
    hitHardCap = true;
    granted = Math.max(0, rewardsConfig.daily.hardCap - todayTotal);
  }

  return { granted, hitSoftCap, hitHardCap };
}

/**
 * Check for combo completions with new runes
 */
async function checkComboCompletions(
  userId: string,
  newRunes: CanonicalRuneId[],
): Promise<RuneComboDef[]> {
  const siteConfig = await db.siteConfig.findUnique({
    where: { id: 'singleton' },
  });

  if (!siteConfig) return [];

  const runesConfig = siteConfig.runes as any;
  const combos = runesConfig?.combos || [];

  const completedCombos: RuneComboDef[] = [];

  for (const combo of combos) {
    if (!combo.isActive) continue;

    // Get user's existing runes
    const userRunes = await db.userRune.findMany({
      where: { userId },
      include: { RuneDef: true },
    });

    const userRuneIds = userRunes.map((ur) => ur.RuneDef.canonicalId);
    const allUserRunes = [...userRuneIds, ...newRunes];

    // Check if combo is completed
    const isCompleted = combo.members.every((member: string) => allUserRunes.includes(member));

    if (isCompleted) {
      completedCombos.push(combo);
    }
  }

  return completedCombos;
}

/**
 * Get rune display information with defaults
 */
export function getRuneDisplay(runeDef: RuneDef): {
  name: string;
  glyph: string;
  lore: string;
} {
  const defaults = {
    name: `Rune ${runeDef.canonicalId.split('_')[1]?.toUpperCase() || '?'}`,
    glyph: '',
  };

  return {
    name: runeDef.displayName || defaults.name,
    glyph: runeDef.glyph || defaults.glyph,
    lore: runeDef.lore || DEFAULT_RUNE_LORE || 'A mysterious rune with unknown properties.',
  };
}
