-- Home Rails Migration
CREATE TABLE IF NOT EXISTS home_rails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- "new", "best", "editors"
  title TEXT NOT NULL,
  product_slugs TEXT[] NOT NULL DEFAULT '{}',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_home_rails_key ON home_rails(key);
CREATE INDEX IF NOT EXISTS idx_home_rails_active ON home_rails(starts_at, ends_at);
