/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { env } from '@/env.mjs';

export async function GET() {
  try {
    // Check if Clerk is properly configured
    if (!env.CLERK_SECRET_KEY) {
      return NextResponse.json(
        {
          error: 'Clerk not configured',
          message: 'Please set CLERK_SECRET_KEY in your environment variables',
        },
        { status: 500 },
      );
    }

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch user profile from your database
    // For now, return a basic profile structure
    const userProfile = {
      id: userId,
      clerk_id: userId,
      email: 'user@example.com', // This would come from Clerk or your DB
      first_name: 'User',
      last_name: 'Profile',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      user: userProfile,
      message: 'Profile retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if Clerk is properly configured
    if (!env.CLERK_SECRET_KEY) {
      return NextResponse.json(
        {
          error: 'Clerk not configured',
          message: 'Please set CLERK_SECRET_KEY in your environment variables',
        },
        { status: 500 },
      );
    }

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { first_name, last_name, avatar_url, preferences } = body;

    // TODO: Update user profile in your database
    // For now, just return success
    const updatedProfile = {
      id: userId,
      clerk_id: userId,
      first_name: first_name || 'User',
      last_name: last_name || 'Profile',
      avatar_url: avatar_url || null,
      preferences: preferences || {},
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      user: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
