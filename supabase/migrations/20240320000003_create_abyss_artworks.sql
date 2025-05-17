-- Create abyss_artworks table
CREATE TABLE IF NOT EXISTS abyss_artworks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE abyss_artworks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view artworks
CREATE POLICY "Authenticated users can view artworks"
    ON abyss_artworks FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only allow admins to modify artworks
CREATE POLICY "Admins can modify artworks"
    ON abyss_artworks FOR ALL
    USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
    ));

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON abyss_artworks
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at(); 