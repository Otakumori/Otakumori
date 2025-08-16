export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserFromSupabase, syncUserToSupabase } from '../../../../utils/supabase/clerk-integration';
import { env } from '@/env';

export async function GET() {
  try {
    // Check if Clerk is properly configured
    if (!env.CLERK_SECRET_KEY) {
      return NextResponse.json(
        { 
          error: 'Clerk not configured',
          message: 'Please set CLERK_SECRET_KEY in your environment variables'
        },
        { status: 500 }
      );
    }

    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data from Supabase
    const userData = await getUserFromSupabase(userId);
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: userData,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if Clerk is properly configured
    if (!env.CLERK_SECRET_KEY) {
      return NextResponse.json(
        { 
          error: 'Clerk not configured',
          message: 'Please set CLERK_SECRET_KEY in your environment variables'
        },
        { status: 500 }
      );
    }

    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, avatar_url, preferences } = body;

    // Get current user data
    const currentUser = await getUserFromSupabase(userId);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Update user data in Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('users')
      .update({
        first_name: first_name || currentUser.first_name,
        last_name: last_name || currentUser.last_name,
        avatar_url: avatar_url || currentUser.avatar_url,
        preferences: preferences || currentUser.preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: data,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
