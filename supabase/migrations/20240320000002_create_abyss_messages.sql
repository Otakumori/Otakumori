-- Create abyss_messages table
CREATE TABLE IF NOT EXISTS abyss_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE abyss_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view messages
DROP POLICY IF EXISTS "Authenticated users can view messages" ON abyss_messages;
CREATE POLICY "Authenticated users can view messages"
    ON abyss_messages FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow users to insert their own messages
DROP POLICY IF EXISTS "Users can insert their own messages" ON abyss_messages;
CREATE POLICY "Users can insert their own messages"
    ON abyss_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own messages
DROP POLICY IF EXISTS "Users can update their own messages" ON abyss_messages;
CREATE POLICY "Users can update their own messages"
    ON abyss_messages FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own messages
DROP POLICY IF EXISTS "Users can delete their own messages" ON abyss_messages;
CREATE POLICY "Users can delete their own messages"
    ON abyss_messages FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON abyss_messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at(); 