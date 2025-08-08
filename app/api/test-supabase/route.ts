import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function GET() {
  try {
    // Change 'users' to any table you want to test
    const { data, error } = await supabase.from('users').select('*').limit(5);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
