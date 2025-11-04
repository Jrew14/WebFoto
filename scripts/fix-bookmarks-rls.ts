import { config } from "dotenv";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  console.log("🔧 Fixing bookmarks table RLS...\n");

  try {
    // Drop existing RLS policies
    console.log("1. Dropping existing RLS policies...");
    
    try {
      await db.execute(sql`DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;`);
      console.log("   ✅ Dropped 'Users can view own bookmarks' policy");
    } catch (e) {
      console.log("   ⚠️  Policy 'Users can view own bookmarks' might not exist");
    }
    
    try {
      await db.execute(sql`DROP POLICY IF EXISTS "Users can create own bookmarks" ON bookmarks;`);
      console.log("   ✅ Dropped 'Users can create own bookmarks' policy");
    } catch (e) {
      console.log("   ⚠️  Policy 'Users can create own bookmarks' might not exist");
    }
    
    try {
      await db.execute(sql`DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;`);
      console.log("   ✅ Dropped 'Users can delete own bookmarks' policy");
    } catch (e) {
      console.log("   ⚠️  Policy 'Users can delete own bookmarks' might not exist");
    }

    // Disable RLS
    console.log("\n2. Disabling RLS on bookmarks table...");
    await db.execute(sql`ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;`);
    console.log("   ✅ Disabled RLS on bookmarks table");

    console.log("\n✅ SUCCESS! Bookmarks table is now ready.");
    console.log("   RLS is disabled - security handled at application level\n");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message || error);
    
    // Print SQL to run manually
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectRef = supabaseUrl.split("//")[1].split(".")[0];
    
    console.log("\n💡 Alternative: Run this SQL directly in Supabase SQL Editor:");
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql\n`);
    console.log("   Paste this SQL:");
    console.log(`
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

-- Disable RLS
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
    `);
  }
}

main().catch((error) => {
  console.error("\n❌ Failed:", error.message);
  process.exit(1);
});
