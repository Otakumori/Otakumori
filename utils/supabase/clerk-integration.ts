import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { env } from '../../env';

// Create a Supabase client that works with Clerk authentication
export async function createSupabaseClientWithClerk() {
  const { userId, getToken } = auth();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Get the JWT token from Clerk
  const token = await getToken({
    template: 'supabase', // We'll create this template
  });

  if (!token) {
    throw new Error('Failed to get authentication token');
  }

  // Create Supabase client with Clerk JWT
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  return supabase;
}

// Create a Supabase client for server-side operations
export function createServerSupabaseClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Create a Supabase client for client-side operations
export function createClientSupabaseClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Helper function to get user data from Supabase using Clerk user ID
export async function getUserFromSupabase(clerkUserId: string) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkUserId)
    .single();

  if (error) {
    console.error('Error fetching user from Supabase:', error);
    return null;
  }

  return data;
}

// Helper function to create/update user in Supabase when Clerk user is created
export async function syncUserToSupabase(clerkUser: any) {
  const supabase = createServerSupabaseClient();
  
  const userData = {
    clerk_id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    first_name: clerkUser.firstName,
    last_name: clerkUser.lastName,
    avatar_url: clerkUser.imageUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(userData, {
      onConflict: 'clerk_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error syncing user to Supabase:', error);
    throw error;
  }

  return data;
}

// Helper function to get user's cart items
export async function getUserCart(clerkUserId: string) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      products (*)
    `)
    .eq('user_id', clerkUserId);

  if (error) {
    console.error('Error fetching user cart:', error);
    return [];
  }

  return data;
}

// Helper function to get user's orders
export async function getUserOrders(clerkUserId: string) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('user_id', clerkUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }

  return data;
}

// Helper function to get user's achievements
export async function getUserAchievements(clerkUserId: string) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (*)
    `)
    .eq('user_id', clerkUserId);

  if (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }

  return data;
}
