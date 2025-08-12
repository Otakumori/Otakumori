-- Enhanced Otakumori Database Schema with Production Optimizations
-- Run this in your Supabase SQL editor after the basic schema

-- =============================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================================================

-- Products and variants performance indexes
CREATE INDEX IF NOT EXISTS idx_products_category_subcategory ON products(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_products_visible_created ON products(visible, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_variants_product_price ON variants(product_id, price_cents);

-- Soapstones performance indexes
CREATE INDEX IF NOT EXISTS idx_soapstones_created_desc ON soapstones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soapstones_clerk_created ON soapstones(clerk_id, created_at DESC);

-- Orders and cart performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_clerk_status ON orders(clerk_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_clerk_product ON cart_items(clerk_id, product_id);

-- =============================================================================
-- ADDITIONAL TABLES FOR ENHANCED FUNCTIONALITY
-- =============================================================================

-- User achievements and progress tracking
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL, -- 'petal_collection', 'game_score', 'soapstone_count'
  achievement_value INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clerk_id, achievement_type)
);

-- Petal collection tracking
CREATE TABLE IF NOT EXISTS petal_collections (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  petals_collected INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  last_collection TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game scores and leaderboards
CREATE TABLE IF NOT EXISTS game_scores (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clerk_id TEXT NOT NULL,
  game_type TEXT NOT NULL, -- 'petal_catch', 'memory_cube', 'brick_breaker'
  score INTEGER NOT NULL,
  game_data JSONB, -- Additional game-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ENHANCED RLS POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE petal_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- User achievements: users can only access their own
CREATE POLICY "user_achievements_select_own" ON user_achievements FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "user_achievements_update_own" ON user_achievements FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "user_achievements_insert_own" ON user_achievements FOR INSERT WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

-- Petal collections: users can only access their own
CREATE POLICY "petal_collections_select_own" ON petal_collections FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "petal_collections_update_own" ON petal_collections FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "petal_collections_insert_own" ON petal_collections FOR INSERT WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

-- Game scores: users can only access their own, but leaderboards are public read
CREATE POLICY "game_scores_select_own" ON game_scores FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');
CREATE POLICY "game_scores_insert_own" ON game_scores FOR INSERT WITH CHECK (clerk_id = auth.jwt() ->> 'sub');

-- Public leaderboard view (read-only, no personal data)
CREATE POLICY "game_scores_leaderboard_read" ON game_scores FOR SELECT USING (true);

-- =============================================================================
-- FUNCTIONS FOR AUTOMATED OPERATIONS
-- =============================================================================

-- Function to automatically create user profile and collections on first sign-in
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO profiles (clerk_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.first_name, 'Anonymous'), NEW.email_addresses[1].email_address)
  ON CONFLICT (clerk_id) DO NOTHING;
  
  -- Insert petal collection
  INSERT INTO petal_collections (clerk_id, petals_collected, total_clicks)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (clerk_id) DO NOTHING;
  
  -- Insert initial achievements
  INSERT INTO user_achievements (clerk_id, achievement_type, achievement_value)
  VALUES 
    (NEW.id, 'petal_collection', 0),
    (NEW.id, 'soapstone_count', 0),
    (NEW.id, 'games_played', 0)
  ON CONFLICT (clerk_id, achievement_type) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update petal collection with rate limiting
CREATE OR REPLACE FUNCTION update_petal_collection(
  user_clerk_id TEXT,
  petals_to_add INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  last_collection_time TIMESTAMP WITH TIME ZONE;
  time_diff INTERVAL;
BEGIN
  -- Get last collection time
  SELECT last_collection INTO last_collection_time
  FROM petal_collections
  WHERE clerk_id = user_clerk_id;
  
  -- Rate limiting: max 1 petal per second
  IF last_collection_time IS NOT NULL THEN
    time_diff := NOW() - last_collection_time;
    IF time_diff < INTERVAL '1 second' THEN
      RETURN FALSE; -- Rate limited
    END IF;
  END IF;
  
  -- Update collection
  INSERT INTO petal_collections (clerk_id, petals_collected, total_clicks, last_collection)
  VALUES (user_clerk_id, petals_to_add, 1, NOW())
  ON CONFLICT (clerk_id) DO UPDATE SET
    petals_collected = petal_collections.petals_collected + EXCLUDED.petals_collected,
    total_clicks = petal_collections.total_clicks + EXCLUDED.total_clicks,
    last_collection = EXCLUDED.last_collection;
  
  -- Update achievement
  UPDATE user_achievements
  SET achievement_value = achievement_value + petals_to_add,
      last_updated = NOW()
  WHERE clerk_id = user_clerk_id AND achievement_type = 'petal_collection';
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION get_game_leaderboard(
  game_type_param TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  rank_position BIGINT,
  clerk_id TEXT,
  display_name TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_scores AS (
    SELECT 
      clerk_id,
      score,
      created_at,
      ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as rank_pos
    FROM game_scores
    WHERE game_type = game_type_param
  )
  SELECT 
    rs.rank_pos,
    rs.clerk_id,
    COALESCE(p.display_name, 'Anonymous') as display_name,
    rs.score,
    rs.created_at
  FROM ranked_scores rs
  LEFT JOIN profiles p ON rs.clerk_id = p.clerk_id
  WHERE rs.rank_pos <= limit_count
  ORDER BY rs.rank_pos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to all new tables
GRANT ALL ON user_achievements TO anon, authenticated;
GRANT ALL ON petal_collections TO anon, authenticated;
GRANT ALL ON game_scores TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample achievements for existing users (if any)
INSERT INTO user_achievements (clerk_id, achievement_type, achievement_value)
SELECT 
  clerk_id,
  'petal_collection',
  0
FROM profiles
ON CONFLICT (clerk_id, achievement_type) DO NOTHING;

-- Insert sample petal collections for existing users
INSERT INTO petal_collections (clerk_id, petals_collected, total_clicks)
SELECT 
  clerk_id,
  0,
  0
FROM profiles
ON CONFLICT (clerk_id) DO NOTHING;
