import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

async function runMigration() {
  const sql = postgres(connectionString!, { max: 1 });

  try {
    console.log("🚀 Running manual payment tracking migration...\n");

    const migrationPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      "006_manual_payment_tracking.sql"
    );

    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("📄 Executing migration SQL...\n");

    // Execute the entire migration
    await sql.unsafe(migrationSQL);

    console.log("✅ Migration executed successfully!\n");

    // Verify
    console.log("🔍 Verifying columns...");
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'purchases' 
      AND column_name IN ('payment_type', 'payment_proof_url', 'manual_payment_method_id', 'verified_by', 'verified_at')
      ORDER BY column_name
    `;

    console.log(`✅ New columns added (${result.length}/5):\n`);
    result.forEach((row) => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });

    // Check existing purchases
    const purchaseCount = await sql`
      SELECT COUNT(*) as count FROM purchases
    `;

    console.log(`\n📊 Total purchases in database: ${purchaseCount[0].count}`);

    console.log("\n🎉 Migration completed successfully!");
    console.log("✅ Purchases table now supports manual payment tracking\n");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.log("\n⚠️  Please run migration manually:");
    console.log("   1. Open Supabase Dashboard > SQL Editor");
    console.log("   2. Copy content from: supabase/migrations/006_manual_payment_tracking.sql");
    console.log("   3. Run the SQL\n");
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
