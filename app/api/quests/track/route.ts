import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { Ratelimit } from "@upstash/ratelimit"; // Disabled due to Redis config issues
import { z } from 'zod';

import { ensureDailyAssignments, userDayNY } from '@/app/lib/quests/server';
import { db } from '@/lib/db';
// import { redis } from "@/lib/redis"; // Disabled due to Redis config issues

const TrackRequestSchema = z.object({
  type: z.string().min(1),
});

// Rate limiter disabled due to Redis config issues
// const questTrackLimiter = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(20, "1 m"),
// });

const EVENT_TO_QUESTS: Record<string, string[]> = {
  'view-product': ['view-3-products'],
  'submit-review': ['add-1-review'],
  'gacha-roll': ['roll-gacha'],
  purchase: ['complete-purchase'],
  'visit-checkout': ['visit-checkout'],
  'browse-collection': ['browse-collections'],
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting disabled due to Redis config issues
    // const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon';
    // const rateResult = await questTrackLimiter.limit(ip);

    // if (!rateResult.success) {
    //   return NextResponse.json({ error: 'rate' }, { status: 429 });
    // }

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'auth' }, { status: 401 });
    }

    const body = TrackRequestSchema.parse(await request.json());

    const questKeys = EVENT_TO_QUESTS[body.type] ?? [];
    if (!questKeys.length) {
      return NextResponse.json({ ok: true, message: 'No quests for this event type' });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'notfound' }, { status: 404 });
    }

    const day = userDayNY();
    await ensureDailyAssignments(user.id, day);

    const assignments = await db.questAssignment.findMany({
      where: {
        userId: user.id,
        day,
        Quest: { key: { in: questKeys } },
      },
      include: { Quest: true },
    });

    if (!assignments.length) {
      return NextResponse.json({ ok: true, updated: 0, quests: [] });
    }

    const updates: Array<ReturnType<typeof db.questAssignment.update>> = [];
    const summaries = assignments.map((assignment) => {
      const target = assignment.target ?? 1;
      const currentProgress = assignment.progress ?? 0;

      if (assignment.completedAt) {
        return {
          key: assignment.Quest?.key ?? '',
          progress: currentProgress,
          target,
          completed: true,
        };
      }

      const nextProgress = Math.min(target, currentProgress + 1);
      const completed = nextProgress >= target;

      updates.push(
        db.questAssignment.update({
          where: { id: assignment.id },
          data: {
            progress: nextProgress,
            completedAt: completed ? new Date() : null,
          },
        }),
      );

      return {
        key: assignment.Quest?.key ?? '',
        progress: nextProgress,
        target,
        completed,
      };
    });

    if (updates.length) {
      await db.$transaction(updates);
    }

    return NextResponse.json({ ok: true, updated: updates.length, quests: summaries });
  } catch (error) {
    console.error('Quest track error', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
