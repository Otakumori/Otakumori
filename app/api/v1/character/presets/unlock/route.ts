
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { CharacterPresetUnlockSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CharacterPresetUnlockSchema.parse(body);

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Check if preset exists
    const preset = await db.characterPreset.findUnique({
      where: { id: validatedData.presetId },
    });

    if (!preset) {
      return NextResponse.json({ ok: false, error: 'Preset not found' }, { status: 404 });
    }

    // Check if user already has this preset
    const existingUnlock = await db.userCharacterPreset.findUnique({
      where: {
        userId_presetId: {
          userId: currentUser.id,
          presetId: validatedData.presetId,
        },
      },
    });

    if (existingUnlock) {
      return NextResponse.json({ ok: false, error: 'Preset already unlocked' }, { status: 400 });
    }

    // Check unlock conditions
    if (preset.unlockCondition) {
      const conditions = preset.unlockCondition as any;

      // Check if user meets unlock conditions
      if (conditions.requiresPetals && currentUser.petalBalance < conditions.requiresPetals) {
        return NextResponse.json({ ok: false, error: 'Insufficient petals' }, { status: 400 });
      }

      if (conditions.requiresLevel && currentUser.level < conditions.requiresLevel) {
        return NextResponse.json({ ok: false, error: 'Insufficient level' }, { status: 400 });
      }

      if (conditions.requiresAchievement) {
        const hasAchievement = await db.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId: currentUser.id,
              achievementId: conditions.requiresAchievement,
            },
          },
        });

        if (!hasAchievement) {
          return NextResponse.json(
            { ok: false, error: 'Required achievement not unlocked' },
            { status: 400 },
          );
        }
      }
    }

    // Unlock the preset
    const unlock = await db.userCharacterPreset.create({
      data: {
        userId: currentUser.id,
        presetId: validatedData.presetId,
      },
    });

    // Deduct petals if required
    if (preset.unlockCondition && (preset.unlockCondition as any).requiresPetals) {
      await db.user.update({
        where: { id: currentUser.id },
        data: {
          petalBalance: {
            decrement: (preset.unlockCondition as any).requiresPetals,
          },
        },
      });

      // Log the petal transaction
      await db.petalLedger.create({
        data: {
          userId: currentUser.id,
          amount: -(preset.unlockCondition as any).requiresPetals,
          type: 'preset_unlock',
          reason: `Unlocked character preset: ${preset.name}`,
        },
      });
    }

    // Create activity
    await db.activity.create({
      data: {
        profileId: currentUser.id,
        type: 'achievement',
        payload: {
          achievementType: 'preset_unlock',
          presetId: preset.id,
          presetName: preset.name,
          presetCategory: preset.category,
          presetRarity: preset.rarity,
        },
        visibility: 'public',
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        success: true,
        presetId: preset.id,
        presetName: preset.name,
        unlockedAt: unlock.unlockedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Character preset unlock error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
