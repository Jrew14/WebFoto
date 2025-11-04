import { config } from "dotenv";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  console.log("🔄 Setting up Supabase Storage policies...\n");

  try {
    // Drop existing storage policies
    console.log("🗑️  Dropping existing storage policies...");
    
    const dropPolicies = [
      sql`DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;`,
      sql`DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;`,
      sql`DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;`,
      sql`DROP POLICY IF EXISTS "Admins can upload photos" ON storage.objects;`,
      sql`DROP POLICY IF EXISTS "Admins can update photos" ON storage.objects;`,
    ];

    for (const query of dropPolicies) {
      try {
        await db.execute(query);
      } catch (e) {
        // Ignore errors if policy doesn't exist
      }
    }
    console.log("  ✅ Dropped existing policies\n");

    // Create storage policies
    console.log("📝 Creating storage policies...\n");

    // Allow authenticated users (especially admins) to upload to photos bucket
    await db.execute(sql`
      CREATE POLICY "Admins can upload photos" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'photos' AND
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `);
    console.log("  ✅ Admins can upload photos");

    // Allow public to view photos (since bucket is public)
    await db.execute(sql`
      CREATE POLICY "Public can view photos" ON storage.objects
      FOR SELECT USING (bucket_id = 'photos');
    `);
    console.log("  ✅ Public can view photos");

    // Allow admins to delete photos
    await db.execute(sql`
      CREATE POLICY "Admins can delete photos" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'photos' AND
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `);
    console.log("  ✅ Admins can delete photos");

    // Allow admins to update photos
    await db.execute(sql`
      CREATE POLICY "Admins can update photos" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'photos' AND
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `);
    console.log("  ✅ Admins can update photos");

    console.log("\n✅ Storage policies setup complete!");
    console.log("\n📋 Summary:");
    console.log("  - Admins can upload to 'photos' bucket");
    console.log("  - Public can view photos");
    console.log("  - Admins can delete photos");
    console.log("  - Admins can update photos");

  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error("\n❌ Failed to setup storage policies:", error.message);
  process.exit(1);
});
