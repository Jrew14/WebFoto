-- Add watermark_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS watermark_url TEXT;

-- Create watermarks folder in storage (if not exists)
-- This will be handled by storage setup

-- Comment for documentation
COMMENT ON COLUMN profiles.watermark_url IS 'URL to admin watermark image stored in Supabase Storage';
