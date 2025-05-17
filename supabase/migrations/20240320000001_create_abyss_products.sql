-- Create abyss_products table
CREATE TABLE IF NOT EXISTS abyss_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_new BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE abyss_products ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to view products
CREATE POLICY "Authenticated users can view products"
    ON abyss_products FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only allow admins to modify products
CREATE POLICY "Admins can modify products"
    ON abyss_products FOR ALL
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
    BEFORE UPDATE ON abyss_products
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at(); 