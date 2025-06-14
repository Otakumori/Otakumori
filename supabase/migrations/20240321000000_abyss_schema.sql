-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for content ratings
CREATE TYPE content_rating AS ENUM ('r18', 'r18+', 'r18g');

-- Create enum for content types
CREATE TYPE content_type AS ENUM ('artwork', 'merchandise', 'forum_post', 'chat_message');

-- Create Abyss products table
CREATE TABLE abyss_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    printify_id TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    tags TEXT[],
    rating content_rating NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Abyss artwork table
CREATE TABLE abyss_artwork (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    artist_id UUID REFERENCES auth.users(id),
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    tags TEXT[],
    rating content_rating NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Abyss forums table
CREATE TABLE abyss_forums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Abyss forum posts table
CREATE TABLE abyss_forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forum_id UUID REFERENCES abyss_forums(id),
    author_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    rating content_rating NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Abyss chat messages table
CREATE TABLE abyss_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    rating content_rating NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Abyss user preferences table
CREATE TABLE abyss_user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    is_abyss_mode_enabled BOOLEAN DEFAULT false,
    content_rating_preference content_rating[] DEFAULT ARRAY['r18'],
    last_verification_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Abyss likes table
CREATE TABLE abyss_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    content_type content_type NOT NULL,
    content_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

-- Create Abyss comments table
CREATE TABLE abyss_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    content_type content_type NOT NULL,
    content_id UUID NOT NULL,
    content TEXT NOT NULL,
    rating content_rating NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE abyss_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE abyss_artwork ENABLE ROW LEVEL SECURITY;
ALTER TABLE abyss_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE abyss_forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE abyss_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE abyss_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE abyss_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE abyss_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
DROP POLICY IF EXISTS "Users can view active Abyss products" ON abyss_products;
CREATE POLICY "Users can view active Abyss products" ON abyss_products
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view active Abyss artwork" ON abyss_artwork;
CREATE POLICY "Users can view active Abyss artwork" ON abyss_artwork
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view active Abyss forums" ON abyss_forums;
CREATE POLICY "Users can view active Abyss forums" ON abyss_forums
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view active Abyss forum posts" ON abyss_forum_posts;
CREATE POLICY "Users can view active Abyss forum posts" ON abyss_forum_posts
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view active Abyss chat messages" ON abyss_chat_messages;
CREATE POLICY "Users can view active Abyss chat messages" ON abyss_chat_messages
    FOR SELECT USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX idx_abyss_products_rating ON abyss_products(rating);
CREATE INDEX idx_abyss_artwork_rating ON abyss_artwork(rating);
CREATE INDEX idx_abyss_forum_posts_rating ON abyss_forum_posts(rating);
CREATE INDEX idx_abyss_chat_messages_rating ON abyss_chat_messages(rating);
CREATE INDEX idx_abyss_likes_content ON abyss_likes(content_type, content_id);
CREATE INDEX idx_abyss_comments_content ON abyss_comments(content_type, content_id); 