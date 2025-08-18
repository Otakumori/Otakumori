import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock equipped state for now - replace with real DB query
    const equippedState = {
      frame: {
        id: 'frame-1',
        name: 'Sakura Frame',
        type: 'frame' as const,
        rarity: 'Rare' as const,
        imageUrl: '/assets/ui/frames/sakura.png'
      },
      overlay: {
        id: 'overlay-1',
        name: 'Ember Glow',
        type: 'overlay' as const,
        rarity: 'Legendary' as const,
        imageUrl: '/assets/ui/overlays/ember.png'
      },
      title: {
        id: 'title-1',
        name: 'Blossom Guardian',
        type: 'title' as const,
        rarity: 'Rare' as const
      },
      badges: [
        {
          id: 'badge-1',
          name: 'First Victory',
          type: 'badge' as const,
          rarity: 'Common' as const
        },
        {
          id: 'badge-2',
          name: 'Petal Collector',
          type: 'badge' as const,
          rarity: 'Rare' as const
        }
      ]
    };

    return NextResponse.json({
      ok: true,
      data: {
        equipped: equippedState
      }
    });

  } catch (error) {
    console.error('Error fetching user state:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
