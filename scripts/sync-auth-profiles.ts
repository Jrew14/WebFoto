import { config } from "dotenv";
import { db } from "../src/db";
import { profiles } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("🔄 Syncing auth users to profiles table...\n");

  try {
    // Get all users from auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    if (!users || users.length === 0) {
      console.log("ℹ️  No users found in auth");
      return;
    }

    console.log(`📊 Found ${users.length} users in auth\n`);

    let created = 0;
    let existing = 0;

    for (const user of users) {
      // Check if profile exists
      const existingProfile = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1);

      if (existingProfile.length === 0) {
        // Create profile
        const role = user.email === process.env.DEFAULT_ADMIN_EMAIL ? 'admin' : 'buyer';
        
        await db.insert(profiles).values({
          id: user.id,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: role as 'admin' | 'buyer',
        });

        console.log(`✅ Created profile for: ${user.email} (${role})`);
        created++;
      } else {
        console.log(`ℹ️  Profile exists: ${user.email}`);
        existing++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created}`);
    console.log(`   Existing: ${existing}`);
    console.log(`   Total: ${users.length}\n`);

    console.log("✅ Sync completed successfully!");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message || error);
    throw error;
  }
}

main().catch((error) => {
  console.error("\n❌ Failed:", error.message);
  process.exit(1);
});
