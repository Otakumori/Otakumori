import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase environment variables not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test the connection with a simple query
    const { data, error } = await supabase.from('users').select('count', { count: 'exact' }).limit(1);
    
    if (error) {
      return NextResponse.json({ 
        error: error.message,
        status: 'connection_failed',
        supabaseUrl: supabaseUrl.replace(/\/.*/, '/[hidden]') // Hide sensitive parts
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      status: 'connected',
      message: 'Supabase connection successful',
      supabaseUrl: supabaseUrl.replace(/\/.*/, '/[hidden]'),
      hasData: data !== null
    });
  } catch (err) {
    return NextResponse.json(
      { 
        error: err instanceof Error ? err.message : 'Unknown error',
        status: 'connection_failed'
      },
      { status: 500 }
    );
  }
}
