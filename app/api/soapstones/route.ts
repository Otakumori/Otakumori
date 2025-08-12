import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseWithToken } from '@/app/lib/supabaseClient';

// Rate limiting: 1 message per 30 seconds per user
const RATE_LIMIT_SECONDS = 30;
const MAX_MESSAGE_LENGTH = 140;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check message length
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` },
        { status: 400 }
      );
    }

    // Check for emojis and reject them
    if (hasEmojis(message)) {
      return NextResponse.json(
        { error: 'Emojis are not allowed in soapstone messages' },
        { status: 400 }
      );
    }

    // Sanitize message (remove HTML, excessive whitespace)
    const sanitizedMessage = sanitizeMessage(message.trim());

    // Get Clerk session token for Supabase
    const { getToken } = auth();
    const token = await getToken({
      template: 'supabase',
    });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Failed to get authentication token' },
        { status: 500 }
      );
    }

    // Create Supabase client with token
    const supabase = createSupabaseWithToken(token);

    // Check rate limiting
    const { data: recentMessage } = await supabase
      .from('soapstones')
      .select('created_at')
      .eq('clerk_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentMessage) {
      const timeSinceLastMessage = Date.now() - new Date(recentMessage.created_at).getTime();
      if (timeSinceLastMessage < RATE_LIMIT_SECONDS * 1000) {
        const remainingSeconds = Math.ceil((RATE_LIMIT_SECONDS * 1000 - timeSinceLastMessage) / 1000);
        return NextResponse.json(
          { error: `Rate limited. Please wait ${remainingSeconds} seconds before posting another message.` },
          { status: 429 }
        );
      }
    }

    // Insert soapstone message
    const { data: soapstone, error } = await supabase
      .from('soapstones')
      .insert([
        {
          clerk_id: userId,
          message: sanitizedMessage,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to insert soapstone:', error);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Update user's soapstone count achievement
    await updateSoapstoneAchievement(supabase, userId);

    // Generate rune sprite URL
    const runeSpriteUrl = generateRuneSprite(sanitizedMessage);

    return NextResponse.json({
      id: soapstone.id,
      message: soapstone.message,
      created_at: soapstone.created_at,
      rune_sprite_url: runeSpriteUrl,
    });

  } catch (error) {
    console.error('Soapstones API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // For public read access, use anonymous Supabase client
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: soapstones, error } = await supabase
      .from('soapstones')
      .select(`
        id,
        message,
        created_at,
        profiles!inner(display_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch soapstones:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Transform data to include rune sprites
    const transformedSoapstones = soapstones.map((soapstone: any) => ({
      id: soapstone.id,
      message: soapstone.message,
      created_at: soapstone.created_at,
      author: {
        display_name: soapstone.profiles?.display_name || 'Anonymous',
        avatar_url: soapstone.profiles?.avatar_url,
      },
      rune_sprite_url: generateRuneSprite(soapstone.message),
    }));

    return NextResponse.json({
      soapstones: transformedSoapstones,
      pagination: {
        limit,
        offset,
        total: transformedSoapstones.length,
      },
    });

  } catch (error) {
    console.error('Soapstones GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions

function hasEmojis(text: string): boolean {
  // Unicode ranges for emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text);
}

function sanitizeMessage(message: string): string {
  // Remove HTML tags
  let sanitized = message.replace(/<[^>]*>/g, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  return sanitized.trim();
}

async function updateSoapstoneAchievement(supabase: any, clerkId: string) {
  try {
    // Update soapstone count achievement
    const { error } = await supabase
      .from('user_achievements')
      .upsert({
        clerk_id: clerkId,
        achievement_type: 'soapstone_count',
        achievement_value: 1,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'clerk_id,achievement_type'
      });

    if (error) {
      console.error('Failed to update soapstone achievement:', error);
    }
  } catch (error) {
    console.error('Error updating soapstone achievement:', error);
  }
}

function generateRuneSprite(message: string): string {
  // This is a placeholder implementation
  // In production, you might:
  // 1. Generate actual rune images using Canvas API
  // 2. Use a service like Cloudinary for image generation
  // 3. Pre-generate a set of rune sprites and map messages to them
  
  // For now, return a placeholder that represents the rune
  const hash = message.split('').reduce((a, b) => {
    a = ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff;
    return a;
  }, 0);
  
  // Generate a simple "rune" based on message hash
  const runeType = Math.abs(hash) % 5; // 5 different rune styles
  const color = ['#ff69b4', '#ff1493', '#ff69b4', '#ff1493', '#ff69b4'][runeType];
  
  // Create a simple SVG rune
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" opacity="0.8"/>
      <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-family="monospace">
        ${message.charAt(0).toUpperCase()}
      </text>
    </svg>
  `;
  
  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
  
  return dataUrl;
}
