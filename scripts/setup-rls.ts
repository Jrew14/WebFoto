import { config } from "dotenv";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  console.log("🔄 Setting up Row Level Security policies...\n");

  try {
    // Enable RLS on all tables
    console.log("🔒 Enabling RLS on tables...");
    
    await db.execute(sql`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`);
    await db.execute(sql`ALTER TABLE photos ENABLE ROW LEVEL SECURITY;`);
    await db.execute(sql`ALTER TABLE events ENABLE ROW LEVEL SECURITY;`);
    await db.execute(sql`ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;`);
    await db.execute(sql`ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;`);
    
    console.log("  ✅ RLS enabled on all tables\n");

    // Drop existing policies first (if any)
    console.log("🗑️  Dropping existing policies...");
    
    const dropPolicies = [
      // Profiles policies
      sql`DROP POLICY IF EXISTS "Users can view own profile" ON profiles;`,
      sql`DROP POLICY IF EXISTS "Users can update own profile" ON profiles;`,
      sql`DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;`,
      
      // Photos policies
      sql`DROP POLICY IF EXISTS "Photos are viewable by everyone" ON photos;`,
      sql`DROP POLICY IF EXISTS "Admins can insert photos" ON photos;`,
      sql`DROP POLICY IF EXISTS "Admins can update photos" ON photos;`,
      sql`DROP POLICY IF EXISTS "Admins can delete photos" ON photos;`,
      
      // Events policies
      sql`DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;`,
      sql`DROP POLICY IF EXISTS "Admins can insert events" ON events;`,
      sql`DROP POLICY IF EXISTS "Admins can update events" ON events;`,
      sql`DROP POLICY IF EXISTS "Admins can delete events" ON events;`,
      
      // Purchases policies
      sql`DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;`,
      sql`DROP POLICY IF EXISTS "Users can create purchases" ON purchases;`,
      sql`DROP POLICY IF EXISTS "Admins can view all purchases" ON purchases;`,
      
      // Bookmarks policies
      sql`DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;`,
      sql`DROP POLICY IF EXISTS "Users can manage own bookmarks" ON bookmarks;`,
    ];

    for (const query of dropPolicies) {
      try {
        await db.execute(query);
      } catch (e) {
        // Ignore errors if policy doesn't exist
      }
    }
    console.log("  ✅ Dropped existing policies\n");

    // Create policies
    console.log("📝 Creating policies...\n");
    
    // ==================== PROFILES ====================
    await db.execute(sql`
      CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
    `);
    console.log("  ✅ Users can view own profile");

    await db.execute(sql`
      CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
    `);
    console.log("  ✅ Users can update own profile");

    await db.execute(sql`
      CREATE POLICY "Enable insert for authenticated users" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
    `);
    console.log("  ✅ Enable insert for authenticated users");

    // ==================== PHOTOS ====================
    await db.execute(sql`
      CREATE POLICY "Photos are viewable by everyone" ON photos
      FOR SELECT USING (true);
    `);
    console.log("  ✅ Photos are viewable by everyone");

    await db.execute(sql`
      CREATE POLICY "Admins can insert photos" ON photos
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `);
    console.log("  ✅ Admins can insert photos");

    await db.execute(sql`
      CREATE POLICY "Admins can update photos" ON photos
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `);
    console.log("  ✅ Admins can update photos");

    await db.execute(sql`
      CREATE POLICY "Admins can delete photos" ON photos
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `);
    console.log("  ✅ Admins can delete photos");

    // ==================== EVENTS ====================
    await db.execute(sql`
      CREATE POLICY "Events are viewable by everyone" ON events
      FOR SELECT USING (true);
    `);
    console.log("  ✅ Events are viewable by everyone");

    await db.execute(sql`
      CREATE POLICY "Admins can insert events" ON events
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `);
    console.log("  ✅ Admins can insert events");

    await db.execute(sql`
      CREATE POLICY "Admins can update events" ON events
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `);
    console.log("  ✅ Admins can update events");

    await db.execute(sql`
      CREATE POLICY "Admins can delete events" ON events
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `);
    console.log("  ✅ Admins can delete events");

    // ==================== PURCHASES ====================
    await db.execute(sql`
      CREATE POLICY "Users can view own purchases" ON purchases
      FOR SELECT USING (auth.uid() = buyer_id);
    `);
    console.log("  ✅ Users can view own purchases");

    await db.execute(sql`
      CREATE POLICY "Users can create purchases" ON purchases
      FOR INSERT WITH CHECK (auth.uid() = buyer_id);
    `);
    console.log("  ✅ Users can create purchases");

    await db.execute(sql`
      CREATE POLICY "Admins can view all purchases" ON purchases
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
    `);
    console.log("  ✅ Admins can view all purchases");

    // ==================== BOOKMARKS ====================
    await db.execute(sql`
      CREATE POLICY "Users can view own bookmarks" ON bookmarks
      FOR SELECT USING (auth.uid() = user_id);
    `);
    console.log("  ✅ Users can view own bookmarks");

    await db.execute(sql`
      CREATE POLICY "Users can manage own bookmarks" ON bookmarks
      FOR ALL USING (auth.uid() = user_id);
    `);
    console.log("  ✅ Users can manage own bookmarks");

    console.log("\n✅ RLS setup complete!");
    console.log("\n📋 Summary:");
    console.log("  - Profiles: Users can view/update own profile");
    console.log("  - Photos: Public read, admin write");
    console.log("  - Events: Public read, admin write");
    console.log("  - Purchases: Users see own purchases, admins see all");
    console.log("  - Bookmarks: Users manage own bookmarks");

  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error("\n❌ Failed to setup RLS:", error.message);
  process.exit(1);
});
