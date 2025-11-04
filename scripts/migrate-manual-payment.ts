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
    console.log("🚀 Running manual payment methods migration...\n");

    const migrationPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      "005_manual_payment_methods.sql"
    );

    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("📄 Executing migration SQL...\n");

    // Execute the entire migration
    await sql.unsafe(migrationSQL);

    console.log("✅ Migration executed successfully!\n");

    // Verify
    console.log("🔍 Verifying table...");
    const result = await sql`
      SELECT COUNT(*) as count FROM manual_payment_methods
    `;

    console.log(`✅ Table created! Row count: ${result[0].count}\n`);

    // Show sample data
    const samples = await sql`
      SELECT name, type, is_active FROM manual_payment_methods LIMIT 5
    `;

    console.log("📊 Sample payment methods:");
    samples.forEach((row) => {
      console.log(
        `   - ${row.name} (${row.type}): ${row.is_active ? "ON" : "OFF"}`
      );
    });

    console.log("\n🎉 Migration completed successfully!");
    console.log("✅ You can now add/edit payment methods in /admin/payment-methods\n");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.log("\n⚠️  Please run migration manually:");
    console.log("   1. Open Supabase Dashboard > SQL Editor");
    console.log("   2. Copy content from: supabase/migrations/005_manual_payment_methods.sql");
    console.log("   3. Run the SQL\n");
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
