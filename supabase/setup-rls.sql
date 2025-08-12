-- Supabase RLS Setup for Clerk RS256 JWT Flow
-- Run this in your Supabase SQL editor

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clerk_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (clerk_id = auth.jwt() ->> 'sub');

-- Create policy for users to update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (clerk_id = auth.jwt() ->> 'sub');

-- Create policy for users to insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

-- Create policy for users to delete their own profile
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  USING (clerk_id = auth.jwt() ->> 'sub');

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (clerk_id, display_name, email)
  VALUES (NEW.id, NEW.first_name, NEW.email_addresses[1].email_address);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user is created
-- Note: This is a placeholder - Clerk handles user creation differently
-- You may need to create profiles manually or through your application logic

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Optional: Create additional tables for your application
-- Example: user_achievements, user_friends, etc.

-- Example of how to query with Clerk JWT:
-- SELECT * FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub';
