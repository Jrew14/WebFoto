import { db } from '@/db';
import { profiles } from '@/db/schema';

async function testConnection() {
  console.log('🔌 Testing database connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic SELECT query');
    const result = await db.select().from(profiles).limit(1);
    console.log('✅ Database connection successful!');
    console.log(`📊 Found ${result.length} profiles in database\n`);
    
    // Test 2: Count query
    console.log('Test 2: Count query');
    const count = await db.select().from(profiles);
    console.log(`✅ Total profiles in database: ${count.length}\n`);
    
    console.log('✅ All tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Run SQL migrations in Supabase SQL Editor');
    console.log('2. Run: bun run scripts/seed-admin.ts');
    console.log('3. Check database connection again\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check if DATABASE_URL is set in .env.local');
    console.error('2. Verify Supabase project is running');
    console.error('3. Ensure network connectivity to Supabase');
    console.error('4. Check if SQL migrations have been run\n');
    
    process.exit(1);
  }
}

testConnection();
