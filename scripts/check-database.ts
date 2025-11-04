import { config } from "dotenv";
import { db } from "../src/db";
import { profiles, photos, events } from "../src/db/schema";

config({ path: ".env.local" });

async function main() {
  console.log("📊 Checking database state...\n");

  try {
    // Check profiles
    const allProfiles = await db.select().from(profiles);
    console.log(`👥 Profiles: ${allProfiles.length}`);
    allProfiles.forEach(p => {
      console.log(`   - ${p.email} (${p.role}) - ID: ${p.id.substring(0, 8)}...`);
    });

    // Check events
    const allEvents = await db.select().from(events);
    console.log(`\n📅 Events: ${allEvents.length}`);
    allEvents.forEach(e => {
      console.log(`   - ${e.name} - ID: ${e.id.substring(0, 8)}...`);
    });

    // Check photos
    const allPhotos = await db.select().from(photos);
    console.log(`\n📷 Photos: ${allPhotos.length}`);
    if (allPhotos.length > 0) {
      allPhotos.slice(0, 5).forEach(p => {
        console.log(`   - ${p.name} - ID: ${p.id.substring(0, 8)}... (Price: ${p.price})`);
      });
      if (allPhotos.length > 5) {
        console.log(`   ... and ${allPhotos.length - 5} more`);
      }
    } else {
      console.log("   ⚠️  No photos found! Upload some photos first.");
    }

  } catch (error: any) {
    console.error("\n❌ Error:", error.message || error);
    throw error;
  }
}

main().catch((error) => {
  console.error("\n❌ Failed:", error.message);
  process.exit(1);
});
