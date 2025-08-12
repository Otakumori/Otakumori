-- Complete Otakumori Database Schema
-- Run this in your Supabase SQL editor

-- Products table (mirrored from Printify for speed/SEO)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,                 -- printify product_id
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,              -- apparel/accessories/home-decor
  subcategory TEXT NOT NULL,           -- tops/bottoms/.../stickers
  image_url TEXT, 
  price_cents INTEGER, 
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants
CREATE TABLE IF NOT EXISTS variants (
  id BIGINT PRIMARY KEY,               -- printify variant_id
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  title TEXT, 
  price_cents INTEGER, 
  sku TEXT, 
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clerk_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Soapstone messages
CREATE TABLE IF NOT EXISTS soapstones (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders (for tracking fulfillment)
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  printify_order_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered
  items JSONB NOT NULL, -- [{product_id, variant_id, quantity, price_cents}]
  shipping_address JSONB NOT NULL,
  total_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items (server-side cart option)
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  variant_id BIGINT NOT NULL REFERENCES variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clerk_id, product_id, variant_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE soapstones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can only access their own profile
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (clerk_id = auth.jwt() ->> 'sub');

-- Soapstones: public read, authenticated write
CREATE POLICY "soapstones_read" ON soapstones FOR SELECT USING (true);
CREATE POLICY "soapstones_write" ON soapstones FOR INSERT WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

-- Orders: users can only access their own orders
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "orders_insert_own" ON orders FOR INSERT WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

-- Cart items: users can only access their own cart
CREATE POLICY "cart_items_select_own" ON cart_items FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "cart_items_insert_own" ON cart_items FOR INSERT WITH CHECK (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "cart_items_update_own" ON cart_items FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "cart_items_delete_own" ON cart_items FOR DELETE USING (clerk_id = auth.jwt() ->> 'sub');

-- Products and variants: public read access
CREATE POLICY "products_read" ON products FOR SELECT USING (visible = true);
CREATE POLICY "variants_read" ON variants FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);
CREATE INDEX IF NOT EXISTS idx_soapstones_clerk_id ON soapstones(clerk_id);
CREATE INDEX IF NOT EXISTS idx_orders_clerk_id ON orders(clerk_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_clerk_id ON cart_items(clerk_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON variants(product_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Sample data insertion (optional - for testing)
INSERT INTO products (id, title, description, category, subcategory, image_url, price_cents) VALUES
('sample-1', 'Anime Hero T-Shirt', 'Classic anime hero design on premium cotton', 'apparel', 'tops', '/assets/products/hero-tshirt.jpg', 2500),
('sample-2', 'Otaku Pin Collection', 'Set of 5 anime-inspired enamel pins', 'accessories', 'pins', '/assets/products/otaku-pins.jpg', 1500),
('sample-3', 'Cherry Blossom Pillow', 'Soft decorative pillow with sakura design', 'home-decor', 'pillows', '/assets/products/sakura-pillow.jpg', 3500)
ON CONFLICT (id) DO NOTHING;

INSERT INTO variants (id, product_id, title, price_cents, sku, options) VALUES
(1, 'sample-1', 'Small', 2500, 'HERO-TS-S', '{"size": "S", "color": "white"}'),
(2, 'sample-1', 'Medium', 2500, 'HERO-TS-M', '{"size": "M", "color": "white"}'),
(3, 'sample-1', 'Large', 2500, 'HERO-TS-L', '{"size": "L", "color": "white"}'),
(4, 'sample-2', 'Standard', 1500, 'OTAKU-PINS', '{"quantity": "5"}'),
(5, 'sample-3', 'Standard', 3500, 'SAKURA-PILLOW', '{"size": "18x18"}')
ON CONFLICT (id) DO NOTHING;
