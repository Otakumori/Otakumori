/**
 * Game Save System API - Simplified Implementation
 */

import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const SaveDataSchema = z.object({
  gameId: z.string().min(1),
  slot: z.number().int().min(0).max(2),
  saveData: z.record(z.string(), z.any()),
  metadata: z
    .object({
      level: z.number().optional(),
      score: z.number().optional(),
      playtime: z.number().optional(),
      achievements: z.array(z.string()).optional(),
      checksum: z.string().optional(),
    })
    .optional(),
});

const LoadRequestSchema = z.object({
  gameId: z.string().min(1),
  slot: z.number().int().min(0).max(2).optional(),
});

async function handler(request: NextRequest, { params }: { params: { gameId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const { gameId } = params;

    if (request.method === 'POST') {
      // Save game state
      const body = await request.json();
      const validation = SaveDataSchema.safeParse({ ...body, gameId });

      if (!validation.success) {
        return NextResponse.json({ ok: false, error: 'Invalid save data format' }, { status: 400 });
      }

      const { slot, saveData, metadata } = validation.data;

      // For now, just return success without persisting
      // This will be updated when the GameSave table is created
      return NextResponse.json({
        ok: true,
        data: {
          saveId: `temp_${Date.now()}`,
          version: 1,
          checksum: 'temp_checksum',
          slot,
        },
      });
    }

    if (request.method === 'GET') {
      // Load game state
      const url = new URL(request.url);
      const slot = url.searchParams.get('slot');

      const validation = LoadRequestSchema.safeParse({
        gameId,
        slot: slot ? parseInt(slot) : undefined,
      });

      if (!validation.success) {
        return NextResponse.json({ ok: false, error: 'Invalid load request' }, { status: 400 });
      }

      // For now, return empty saves
      // This will be updated when the database integration is complete
      return NextResponse.json({
        ok: true,
        data: {
          saves: [],
          totalSaves: 0,
        },
      });
    }

    return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Game save error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = handler;
export const GET = handler;
export const runtime = 'nodejs';
