-- Disable RLS for bookmarks table to allow server-side operations via Drizzle ORM
-- This is needed because Drizzle ORM doesn't run in Supabase auth context

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

-- Disable RLS on bookmarks table
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;

-- Note: Security is now handled at application level through server actions
-- Only authenticated users can access bookmark actions via Next.js API
