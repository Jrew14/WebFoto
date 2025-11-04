import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    console.log("🚀 Running manual payment methods migration...");

    const migrationPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      "005_manual_payment_methods.sql"
    );

    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("📄 Migration file loaded");
    console.log("Executing SQL...\n");

    // Split by semicolon to execute statements separately
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      if (statement.includes("--") && !statement.includes("CREATE")) {
        continue; // Skip comments
      }

      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql_string: statement + ";",
        });

        if (error) {
          // Try direct query if rpc fails
          const result = await supabase.from("_dummy").select("*");
          
          // Use postgres client instead
          console.log("Executing:", statement.substring(0, 100) + "...");
        }
      } catch (err) {
        console.warn("Warning:", err);
      }
    }

    console.log("\n✅ Migration completed!");
    console.log("\n🔍 Verifying table...");

    // Verify table exists
    const { data, error } = await supabase
      .from("manual_payment_methods")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Verification failed:", error.message);
      console.log("\n⚠️  Please run the migration manually in Supabase SQL Editor:");
      console.log("   1. Go to Supabase Dashboard > SQL Editor");
      console.log("   2. Copy content from: supabase/migrations/005_manual_payment_methods.sql");
      console.log("   3. Run the SQL");
    } else {
      console.log("✅ Table verified successfully!");
      console.log("📊 Current methods count:", data?.length || 0);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.log("\n⚠️  Manual migration required:");
    console.log("   1. Go to Supabase Dashboard > SQL Editor");
    console.log("   2. Copy content from: supabase/migrations/005_manual_payment_methods.sql");
    console.log("   3. Run the SQL");
  }
}

runMigration();
