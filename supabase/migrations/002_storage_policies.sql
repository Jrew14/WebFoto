-- =====================================================
-- PIKSEL JUAL - STORAGE BUCKETS & POLICIES
-- Supabase Storage Configuration
-- =====================================================

-- =====================================================
-- 1. CREATE STORAGE BUCKETS
-- =====================================================

-- Bucket for photos (preview, full, watermark)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE POLICIES FOR PHOTOS BUCKET
-- =====================================================

-- Allow public read access to all photos
CREATE POLICY "Public photos read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Allow admin to upload photos
CREATE POLICY "Admin can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'photos' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Allow admin to update own photos
CREATE POLICY "Admin can update own photos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'photos' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Allow admin to delete own photos
CREATE POLICY "Admin can delete own photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'photos' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =====================================================
-- 3. STORAGE POLICIES FOR AVATARS BUCKET
-- =====================================================

-- Allow public read access to all avatars
CREATE POLICY "Public avatars read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- 4. FOLDER STRUCTURE GUIDELINES
-- =====================================================

/*
Photos Bucket Structure:
photos/
  ├── {photographer_id}/
  │   ├── {event_id}/
  │   │   ├── preview/
  │   │   │   ├── photo1.jpg
  │   │   │   └── photo2.jpg
  │   │   ├── full/
  │   │   │   ├── photo1.jpg
  │   │   │   └── photo2.jpg
  │   │   └── watermark/
  │   │       ├── photo1.jpg
  │   │       └── photo2.jpg

Avatars Bucket Structure:
avatars/
  ├── {user_id}/
  │   └── avatar.jpg
*/

-- =====================================================
-- 5. HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Function to generate consistent photo paths
CREATE OR REPLACE FUNCTION generate_photo_path(
    photographer_uuid UUID,
    event_uuid UUID,
    photo_name TEXT,
    photo_type TEXT -- 'preview', 'full', or 'watermark'
)
RETURNS TEXT AS $$
BEGIN
    RETURN photographer_uuid::TEXT || '/' || 
           event_uuid::TEXT || '/' || 
           photo_type || '/' || 
           photo_name;
END;
$$ LANGUAGE plpgsql;

-- Function to generate avatar path
CREATE OR REPLACE FUNCTION generate_avatar_path(user_uuid UUID, filename TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN user_uuid::TEXT || '/' || filename;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. STORAGE CLEANUP TRIGGERS
-- =====================================================

-- Function to delete photos from storage when photo record is deleted
CREATE OR REPLACE FUNCTION delete_photo_files()
RETURNS TRIGGER AS $$
DECLARE
    preview_path TEXT;
    full_path TEXT;
    watermark_path TEXT;
BEGIN
    -- Extract paths from URLs
    preview_path := split_part(OLD.preview_url, '/photos/', 2);
    full_path := split_part(OLD.full_url, '/photos/', 2);
    
    IF OLD.watermark_url IS NOT NULL THEN
        watermark_path := split_part(OLD.watermark_url, '/photos/', 2);
    END IF;

    -- Delete files from storage
    PERFORM storage.delete_object('photos', preview_path);
    PERFORM storage.delete_object('photos', full_path);
    
    IF watermark_path IS NOT NULL THEN
        PERFORM storage.delete_object('photos', watermark_path);
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_delete_photo_files
    BEFORE DELETE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION delete_photo_files();

-- Function to delete avatar from storage when profile is updated
CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS TRIGGER AS $$
DECLARE
    old_avatar_path TEXT;
BEGIN
    IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url != NEW.avatar_url THEN
        old_avatar_path := split_part(OLD.avatar_url, '/avatars/', 2);
        PERFORM storage.delete_object('avatars', old_avatar_path);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_cleanup_old_avatar
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.avatar_url IS DISTINCT FROM NEW.avatar_url)
    EXECUTE FUNCTION cleanup_old_avatar();

-- =====================================================
-- STORAGE CONFIGURATION COMPLETE
-- =====================================================

-- Verify buckets were created:
-- SELECT * FROM storage.buckets;

-- Verify policies:
-- SELECT * FROM pg_policies WHERE schemaname = 'storage';
