-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_sign_in TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMP WITH TIME ZONE
);

-- Create profiles table (additional user information)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    location TEXT,
    website TEXT,
    social_links JSONB,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    published BOOLEAN DEFAULT TRUE
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT like_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Create followers table
CREATE TABLE IF NOT EXISTS followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(follower_id, following_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create post_tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (post_id, tag_id)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    images TEXT[],
    variants JSONB,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
CREATE POLICY "Public posts are viewable by everyone" ON posts
    FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
CREATE POLICY "Users can create their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- Additional RLS policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark their notifications as read" ON notifications;
CREATE POLICY "Users can mark their notifications as read" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
CREATE POLICY "Users can create their own likes" ON likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
CREATE POLICY "Users can delete their own likes" ON likes
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes" ON likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own comments" ON comments;
CREATE POLICY "Users can create their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all comments" ON comments;
CREATE POLICY "Users can view all comments" ON comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON followers;
CREATE POLICY "Users can follow others" ON followers
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow others" ON followers;
CREATE POLICY "Users can unfollow others" ON followers
    FOR DELETE USING (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can view all followers" ON followers;
CREATE POLICY "Users can view all followers" ON followers
    FOR SELECT USING (true);

-- Create seed data
INSERT INTO tags (name) VALUES
    ('anime'),
    ('manga'),
    ('gaming'),
    ('art'),
    ('cosplay'),
    ('merchandise'),
    ('discussion'),
    ('news'),
    ('reviews'),
    ('community')
ON CONFLICT (name) DO NOTHING;

-- Create a function to handle post creation with tags
CREATE OR REPLACE FUNCTION create_post_with_tags(
    p_user_id UUID,
    p_title TEXT,
    p_content TEXT,
    p_image_url TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_post_id UUID;
    v_tag_id UUID;
    v_tag_name TEXT;
BEGIN
    -- Create the post
    INSERT INTO posts (user_id, title, content, image_url)
    VALUES (p_user_id, p_title, p_content, p_image_url)
    RETURNING id INTO v_post_id;

    -- Add tags if provided
    IF p_tags IS NOT NULL THEN
        FOREACH v_tag_name IN ARRAY p_tags
        LOOP
            -- Get or create tag
            INSERT INTO tags (name)
            VALUES (v_tag_name)
            ON CONFLICT (name) DO NOTHING
            RETURNING id INTO v_tag_id;

            -- Link tag to post
            INSERT INTO post_tags (post_id, tag_id)
            VALUES (v_post_id, v_tag_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    RETURN v_post_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a profile for the new user
    INSERT INTO profiles (user_id)
    VALUES (NEW.id);

    -- Create a welcome notification
    INSERT INTO notifications (user_id, type, content)
    VALUES (NEW.id, 'welcome', 'Welcome to Otaku-mori! We''re excited to have you here.');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create a function to handle post likes
CREATE OR REPLACE FUNCTION handle_post_like()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts
        SET likes_count = likes_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts
        SET likes_count = likes_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post likes
CREATE TRIGGER on_post_like
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW
    WHEN (pg_trigger_depth() = 0 AND ((NEW IS NOT NULL AND NEW.post_id IS NOT NULL) OR (OLD IS NOT NULL AND OLD.post_id IS NOT NULL)))
    EXECUTE FUNCTION handle_post_like();

-- Create a function to handle comment likes
CREATE OR REPLACE FUNCTION handle_comment_like()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments
        SET likes_count = likes_count + 1
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments
        SET likes_count = likes_count - 1
        WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment likes
CREATE TRIGGER on_comment_like
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW
    WHEN (pg_trigger_depth() = 0 AND ((NEW IS NOT NULL AND NEW.comment_id IS NOT NULL) OR (OLD IS NOT NULL AND OLD.comment_id IS NOT NULL)))
    EXECUTE FUNCTION handle_comment_like();

-- Create a function to handle post comments
CREATE OR REPLACE FUNCTION handle_post_comment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts
        SET comments_count = comments_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post comments
CREATE TRIGGER on_post_comment
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION handle_post_comment();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_comment_id ON likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- Add helper functions for the verification script
CREATE OR REPLACE FUNCTION get_policies()
RETURNS TABLE (
    tablename text,
    policyname text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.relname::text as tablename,
        p.polname::text as policyname
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname NOT LIKE 'pg_%'
    ORDER BY c.relname, p.polname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_functions()
RETURNS TABLE (
    proname text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.proname::text
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    ORDER BY p.proname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_triggers()
RETURNS TABLE (
    tgname text,
    relname text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tgname::text,
        c.relname::text
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE NOT t.tgisinternal
    ORDER BY c.relname, t.tgname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete related records
    DELETE FROM profiles WHERE user_id = OLD.id;
    DELETE FROM posts WHERE user_id = OLD.id;
    DELETE FROM comments WHERE user_id = OLD.id;
    DELETE FROM likes WHERE user_id = OLD.id;
    DELETE FROM followers WHERE follower_id = OLD.id OR following_id = OLD.id;
    DELETE FROM notifications WHERE user_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_deletion
    BEFORE DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_deletion();

-- Add function to handle content moderation
CREATE OR REPLACE FUNCTION moderate_content()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for inappropriate content in posts
    IF TG_TABLE_NAME = 'posts' THEN
        IF NEW.content ~* '(?i)(spam|inappropriate|offensive)' THEN
            NEW.published := FALSE;
            INSERT INTO notifications (user_id, type, content)
            VALUES (NEW.user_id, 'moderation', 'Your post has been flagged for review.');
        END IF;
    END IF;
    
    -- Check for inappropriate content in comments
    IF TG_TABLE_NAME = 'comments' THEN
        IF NEW.content ~* '(?i)(spam|inappropriate|offensive)' THEN
            INSERT INTO notifications (user_id, type, content)
            VALUES (NEW.user_id, 'moderation', 'Your comment has been flagged for review.');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_content_creation
    BEFORE INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION moderate_content();

CREATE TRIGGER on_comment_creation
    BEFORE INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION moderate_content();

-- Add function to handle user activity tracking
CREATE OR REPLACE FUNCTION track_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last activity timestamp
    UPDATE users
    SET last_sign_in = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_activity
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION track_user_activity();

-- Add function to handle content search
CREATE OR REPLACE FUNCTION search_content(search_term TEXT)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    content TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        'post'::TEXT as type,
        p.title,
        p.content,
        p.user_id,
        p.created_at,
        similarity(p.title || ' ' || p.content, search_term) as similarity
    FROM posts p
    WHERE 
        p.published = TRUE AND
        (p.title || ' ' || p.content) % search_term
    UNION ALL
    SELECT 
        c.id,
        'comment'::TEXT as type,
        NULL as title,
        c.content,
        c.user_id,
        c.created_at,
        similarity(c.content, search_term) as similarity
    FROM comments c
    WHERE c.content % search_term
    ORDER BY similarity DESC;
END;
$$ LANGUAGE plpgsql;

-- Add function to get user feed
CREATE OR REPLACE FUNCTION get_user_feed(user_id UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    content TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ,
    likes_count INTEGER,
    comments_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        'post'::TEXT as type,
        p.title,
        p.content,
        p.user_id,
        p.created_at,
        p.likes_count,
        p.comments_count
    FROM posts p
    WHERE 
        p.published = TRUE AND
        (
            p.user_id = user_id OR
            p.user_id IN (
                SELECT following_id 
                FROM followers 
                WHERE follower_id = user_id
            )
        )
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add function to get trending content
CREATE OR REPLACE FUNCTION get_trending_content(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ,
    likes_count INTEGER,
    comments_count INTEGER,
    engagement_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.content,
        p.user_id,
        p.created_at,
        p.likes_count,
        p.comments_count,
        (p.likes_count + (p.comments_count * 2))::FLOAT / 
        EXTRACT(EPOCH FROM (NOW() - p.created_at))::FLOAT as engagement_score
    FROM posts p
    WHERE 
        p.published = TRUE AND
        p.created_at > NOW() - INTERVAL '7 days'
    ORDER BY engagement_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create policies for products
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
CREATE POLICY "Public products are viewable by everyone" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own products" ON products;
CREATE POLICY "Users can create their own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own products" ON products;
CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own products" ON products;
CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for blog_posts
DROP POLICY IF EXISTS "Public blog posts are viewable by everyone" ON blog_posts;
CREATE POLICY "Public blog posts are viewable by everyone" ON blog_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own blog posts" ON blog_posts;
CREATE POLICY "Users can create their own blog posts" ON blog_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own blog posts" ON blog_posts;
CREATE POLICY "Users can update their own blog posts" ON blog_posts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own blog posts" ON blog_posts;
CREATE POLICY "Users can delete their own blog posts" ON blog_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for comments
DROP POLICY IF EXISTS "Public comments are viewable by everyone" ON comments;
CREATE POLICY "Public comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own comments" ON comments;
CREATE POLICY "Users can create their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for faster search
CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);
CREATE INDEX IF NOT EXISTS idx_blog_posts_title ON blog_posts(title);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id); 