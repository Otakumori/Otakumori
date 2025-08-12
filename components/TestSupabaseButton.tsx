'use client';

import { useAuth } from '@clerk/nextjs';
import { createSupabaseWithToken } from '@/app/lib/supabaseClient';

export function TestSupabaseButton() {
  const { getToken, isSignedIn } = useAuth();
  
  if (!isSignedIn) return null;

  const run = async () => {
    try {
      const token = await getToken(); // session token (RS256)
      if (!token) {
        console.error('No token available');
        return;
      }
      
      const supabase = createSupabaseWithToken(token);
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      
      console.log('Supabase test result:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
      } else {
        console.log('Supabase connection successful:', data);
      }
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  return (
    <button 
      onClick={run} 
      className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs opacity-50 hover:opacity-100 transition-opacity"
      title="Test Supabase connection with Clerk token"
    >
      Test DB
    </button>
  );
}
