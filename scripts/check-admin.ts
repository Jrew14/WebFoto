import { config } from "dotenv";
import { db } from "../src/db";
import { profiles } from "../src/db/schema";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("🔍 Checking admin user and profile...\n");

  // Get admin user from auth
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("❌ Error listing users:", listError);
    return;
  }

  const adminUser = users.users.find(u => u.email === process.env.DEFAULT_ADMIN_EMAIL || u.email === "admin@gmail.com");

  if (!adminUser) {
    console.log("❌ Admin user not found in auth");
    return;
  }

  console.log("✅ Admin user found in auth:");
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   ID: ${adminUser.id}`);
  console.log(`   Email confirmed: ${adminUser.email_confirmed_at ? 'Yes' : 'No'}\n`);

  // Check profile in database
  const profilesData = await db.select().from(profiles);
  
  console.log(`📋 Total profiles in database: ${profilesData.length}\n`);

  const adminProfile = profilesData.find(p => p.id === adminUser.id);

  if (!adminProfile) {
    console.log("❌ Admin profile not found in database");
    console.log("   Running seed:admin might fix this\n");
    return;
  }

  console.log("✅ Admin profile found in database:");
  console.log(`   ID: ${adminProfile.id}`);
  console.log(`   Email: ${adminProfile.email}`);
  console.log(`   Full Name: ${adminProfile.fullName}`);
  console.log(`   Role: ${adminProfile.role}`);
  console.log(`   Phone: ${adminProfile.phone || '(not set)'}\n`);

  if (adminProfile.role !== 'admin') {
    console.log("⚠️  WARNING: Profile role is not 'admin'!");
    console.log("   This will cause RLS policy violations");
    console.log("   Run: bun run seed:admin to fix\n");
  } else {
    console.log("✅ Admin setup is correct!\n");
  }

  console.log("📊 All profiles:");
  profilesData.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.email} (${p.role}) - ${p.fullName}`);
  });
}

main().catch((error) => {
  console.error("\n❌ Failed:", error.message);
  process.exit(1);
});
