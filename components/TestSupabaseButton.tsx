'use client';

import { useAuth } from '@clerk/nextjs';
// import { createSupabaseWithToken } from '@/app/lib/supabaseClient';

export function TestSupabaseButton() {
  // Disabled during Supabase to Prisma migration
  return null;
  
  const { getToken, isSignedIn } = useAuth();
  
  if (!isSignedIn) return null;

  const run = async () => {
    try {
      const token = await getToken(); // session token (RS256)
      if (!token) {
        console.error('No token available');
        return;
      }
      
      // TODO: Implement with Prisma instead of Supabase
      // const supabase = createSupabaseWithToken(token);
      // const { data, error } = await supabase.from('profiles').select('*').limit(1);
      
      console.log('Prisma migration in progress - Supabase disabled');
      
      // For now, just log that we're migrating
      console.log('Database migration in progress');
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
