/**
 * Check Profiles Table
 * 
 * This script checks if profiles table exists and shows sample data
 */

import { db } from '../src/db';
import { profiles } from '../src/db/schema';

async function checkProfilesTable() {
  try {
    console.log('🔍 Checking profiles table...\n');

    // Get all profiles
    const allProfiles = await db.select().from(profiles);
    
    console.log(`📊 Total profiles in database: ${allProfiles.length}\n`);

    if (allProfiles.length === 0) {
      console.log('⚠️  No profiles found in database.');
      console.log('');
      console.log('💡 Make sure you have:');
      console.log('   1. Run migrations: bun run supabase db push');
      console.log('   2. Created admin user via signup');
      console.log('');
      return;
    }

    console.log('👥 Profiles:\n');
    
    allProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.fullName}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Phone: ${profile.phone || 'Not set'}`);
      console.log(`   Avatar: ${profile.avatarUrl || 'Not set'}`);
      console.log(`   Created: ${profile.createdAt.toLocaleString('id-ID')}`);
      console.log('');
    });

    console.log('✅ Profiles table is ready!');

  } catch (error: any) {
    console.error('❌ Error checking profiles table:', error);
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('');
      console.log('💡 The profiles table does not exist yet.');
      console.log('   Run: bun run supabase db push');
      console.log('');
    }
    
    throw error;
  }
}

// Run the script
checkProfilesTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
