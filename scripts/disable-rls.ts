import { config } from "dotenv";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  console.log("⚠️  Disabling RLS for easier development...\n");

  try {
    await db.execute(sql`ALTER TABLE photos DISABLE ROW LEVEL SECURITY;`);
    console.log("✅ Disabled RLS on photos table");

    await db.execute(sql`ALTER TABLE events DISABLE ROW LEVEL SECURITY;`);
    console.log("✅ Disabled RLS on events table");

    await db.execute(sql`ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;`);
    console.log("✅ Disabled RLS on purchases table");

    await db.execute(sql`ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;`);
    console.log("✅ Disabled RLS on bookmarks table");

    console.log("\n⚠️  WARNING: RLS is now disabled!");
    console.log("   This is OK for development");
    console.log("   For production, enable RLS and fix auth context\n");

  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error("\n❌ Failed:", error.message);
  process.exit(1);
});
