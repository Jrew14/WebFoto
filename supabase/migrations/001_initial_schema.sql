-- =====================================================
-- PIKSEL JUAL - DATABASE SCHEMA
-- Supabase PostgreSQL Migration
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('admin', 'buyer')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    photographer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Anyone can view events"
    ON events FOR SELECT
    USING (true);

CREATE POLICY "Admin can insert events"
    ON events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can update own events"
    ON events FOR UPDATE
    USING (
        photographer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can delete own events"
    ON events FOR DELETE
    USING (
        photographer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_photographer ON events(photographer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);

-- Trigger for updated_at
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. PHOTOS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    photographer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    preview_url TEXT NOT NULL,
    full_url TEXT NOT NULL,
    watermark_url TEXT,
    price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
    sold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for photos
CREATE POLICY "Anyone can view photos"
    ON photos FOR SELECT
    USING (true);

CREATE POLICY "Admin can insert photos"
    ON photos FOR INSERT
    WITH CHECK (
        photographer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can update own photos"
    ON photos FOR UPDATE
    USING (
        photographer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can delete own photos"
    ON photos FOR DELETE
    USING (
        photographer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_photos_event ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_photographer ON photos(photographer_id);
CREATE INDEX IF NOT EXISTS idx_photos_sold ON photos(sold);
CREATE INDEX IF NOT EXISTS idx_photos_name ON photos USING gin(name gin_trgm_ops);

-- Trigger for updated_at
CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. PURCHASES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed')),
    transaction_id TEXT UNIQUE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, photo_id)
);

-- Enable Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchases
CREATE POLICY "Users can view own purchases"
    ON purchases FOR SELECT
    USING (buyer_id = auth.uid());

CREATE POLICY "Admin can view all purchases"
    ON purchases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create purchases"
    ON purchases FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update own purchases"
    ON purchases FOR UPDATE
    USING (buyer_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_photo ON purchases(photo_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_transaction ON purchases(transaction_id);

-- =====================================================
-- 5. BOOKMARKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, photo_id)
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookmarks
CREATE POLICY "Users can view own bookmarks"
    ON bookmarks FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookmarks"
    ON bookmarks FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks"
    ON bookmarks FOR DELETE
    USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_photo ON bookmarks(photo_id);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to get photo count per event
CREATE OR REPLACE FUNCTION get_event_photo_count(event_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM photos
        WHERE event_id = event_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- Function to mark photo as sold after purchase
CREATE OR REPLACE FUNCTION mark_photo_sold()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'success' THEN
        UPDATE photos
        SET sold = true
        WHERE id = NEW.photo_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_photo_sold
    AFTER INSERT OR UPDATE ON purchases
    FOR EACH ROW
    WHEN (NEW.payment_status = 'success')
    EXECUTE FUNCTION mark_photo_sold();

-- =====================================================
-- 7. VIEWS (Optional, untuk kemudahan query)
-- =====================================================

-- View for photos with event and photographer info
CREATE OR REPLACE VIEW photos_with_details AS
SELECT 
    p.id,
    p.name,
    p.preview_url,
    p.full_url,
    p.watermark_url,
    p.price,
    p.sold,
    p.created_at,
    e.id as event_id,
    e.name as event_name,
    e.event_date,
    ph.id as photographer_id,
    ph.full_name as photographer_name,
    ph.email as photographer_email
FROM photos p
JOIN events e ON p.event_id = e.id
JOIN profiles ph ON p.photographer_id = ph.id;

-- View for user gallery (purchases + bookmarks)
CREATE OR REPLACE VIEW user_gallery AS
SELECT 
    p.id,
    p.name,
    p.preview_url,
    p.price,
    p.event_id,
    e.name as event_name,
    pu.buyer_id,
    pu.purchased_at,
    b.created_at as bookmarked_at,
    CASE WHEN pu.id IS NOT NULL THEN true ELSE false END as is_purchased,
    CASE WHEN b.id IS NOT NULL THEN true ELSE false END as is_bookmarked
FROM photos p
JOIN events e ON p.event_id = e.id
LEFT JOIN purchases pu ON p.id = pu.photo_id AND pu.payment_status = 'success'
LEFT JOIN bookmarks b ON p.id = b.photo_id;

-- =====================================================
-- 8. SEED DATA (Optional - for development)
-- =====================================================

-- Note: Run this only for development/testing
-- In production, data will be created through the app

-- Insert sample admin profile (after auth.users is created)
-- This should be done after user signs up via Supabase Auth
-- Example:
-- INSERT INTO profiles (id, email, full_name, role)
-- VALUES (
--     'your-auth-user-id',
--     'admin@pikseljual.com',
--     'Admin Photographer',
--     'admin'
-- );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Run this to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Run this to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
