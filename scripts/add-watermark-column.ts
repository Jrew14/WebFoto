import { config } from "dotenv";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

async function addWatermarkColumn() {
  console.log("🔄 Adding watermark_url column to profiles table...");

  try {
    // Add column using raw SQL
    await db.execute(sql`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS watermark_url TEXT;
    `);

    console.log("✅ Column added successfully!");
    
    // Verify column exists
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'watermark_url';
    `);

    if (result.length > 0) {
      console.log("✅ Verified: watermark_url column exists");
      console.log(`   Type: ${(result[0] as any).data_type}`);
    }

    console.log("\n📝 Summary:");
    console.log("- watermark_url column added to profiles table");
    console.log("- Admin can now upload watermark PNG in profile settings");
    console.log("- Watermark will be applied to preview photos during upload");
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

addWatermarkColumn()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });
