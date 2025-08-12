-- Admin tables for Otaku-Mori
-- Run this migration to create the required tables for the admin dashboard

-- Pages table
create table if not exists pages (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  body_mdx text not null,
  status text not null default 'draft', -- draft|published|archived
  updated_at timestamptz default now(),
  published_at timestamptz
);

-- Blog posts table
create table if not exists posts (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  body_mdx text not null,
  cover_url text,
  status text not null default 'draft',
  tags text[] default '{}',
  updated_at timestamptz default now(),
  published_at timestamptz
);

-- Mini-game configs (versioned)
create table if not exists minigames (
  id bigserial primary key,
  key text unique not null,      -- 'petals', 'soapstones', etc.
  version int not null default 1,
  config jsonb not null,         -- spawn rates, colors, caps, etc.
  status text not null default 'active'
);

-- Soapstones table (with moderation)
create table if not exists soapstones (
  id bigserial primary key,
  message text not null,
  clerk_sub text not null,       -- Clerk user ID
  is_hidden boolean default false,
  created_at timestamptz default now()
);

-- Products table (for Printify sync)
create table if not exists products (
  id bigint primary key,         -- Printify product ID
  title text not null,
  description text,
  category text not null,        -- 'apparel', 'accessories', 'home-decor'
  subcategory text not null,     -- 'tops', 'bottoms', 'pins', etc.
  image_url text,
  price_cents integer,           -- in cents
  visible boolean default true,
  updated_at timestamptz default now()
);

-- Product variants table
create table if not exists variants (
  id bigint primary key,         -- Printify variant ID
  product_id bigint references products(id) on delete cascade,
  title text not null,
  price_cents integer not null,  -- in cents
  sku text,
  options jsonb default '{}',    -- size, color, etc.
  created_at timestamptz default now()
);

-- Game progress tracking
create table if not exists game_progress (
  clerk_sub text primary key,
  petals int not null default 0,
  runes int not null default 0,
  last_claimed date
);

-- Daily game tracking
create table if not exists game_daily (
  clerk_sub text,
  day date not null,
  petals int not null default 0,
  primary key (clerk_sub, day)
);

-- Enable RLS on all tables
alter table pages enable row level security;
alter table posts enable row level security;
alter table minigames enable row level security;
alter table soapstones enable row level security;
alter table products enable row level security;
alter table variants enable row level security;
alter table game_progress enable row level security;
alter table game_daily enable row level security;

-- Helper function to check admin via Clerk RS256 token
create or replace function is_admin() returns boolean language sql stable
as $$ select (auth.jwt()->>'role') = 'admin' $$;

-- RLS policies for public read access
create policy "pages_read_public" on pages for select using (status = 'published');
create policy "posts_read_public" on posts for select using (status = 'published');
create policy "minigames_read" on minigames for select using (true);
create policy "soapstones_read_public" on soapstones for select using (not is_hidden);
create policy "products_read_public" on products for select using (visible);
create policy "variants_read_public" on variants for select using (true);

-- RLS policies for admin write access
create policy "pages_admin_write" on pages for all using (is_admin()) with check (is_admin());
create policy "posts_admin_write" on posts for all using (is_admin()) with check (is_admin());
create policy "minigames_admin" on minigames for all using (is_admin()) with check (is_admin());
create policy "soapstones_admin" on soapstones for all using (is_admin()) with check (is_admin());
create policy "products_admin" on products for all using (is_admin()) with check (is_admin());
create policy "variants_admin" on variants for all using (is_admin()) with check (is_admin());

-- RLS policies for user game data
create policy "game_read_self" on game_progress for select using (auth.jwt()->>'sub' = clerk_sub);
create policy "game_write_self" on game_progress for update using (auth.jwt()->>'sub' = clerk_sub) with check (auth.jwt()->>'sub' = clerk_sub);
create policy "daily_read_self" on game_daily for select using (auth.jwt()->>'sub' = clerk_sub);
create policy "daily_write_self" on game_daily for insert with check (auth.jwt()->>'sub' = clerk_sub);

-- Insert default minigame configs
insert into minigames (key, config) values 
  ('petals', '{"spawnRate": 0.1, "maxPetals": 50, "colors": ["#ff69b4", "#ff1493", "#ff69b4"], "dailyGoal": 100}'),
  ('soapstones', '{"maxLength": 140, "rateLimit": 30, "moderation": true}')
on conflict (key) do nothing;

-- Create indexes for performance
create index if not exists idx_pages_slug on pages(slug);
create index if not exists idx_pages_status on pages(status);
create index if not exists idx_posts_slug on posts(slug);
create index if not exists idx_posts_status on posts(status);
create index if not exists idx_soapstones_created on soapstones(created_at);
create index if not exists idx_soapstones_hidden on soapstones(is_hidden);
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_visible on products(visible);
create index if not exists idx_variants_product on variants(product_id);
create index if not exists idx_game_daily_date on game_daily(day);
