import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function fixMigrationState() {
  try {
    console.log('🔍 Current migration records:');
    const current = await sql`
      SELECT id, hash, created_at
      FROM drizzle.__drizzle_migrations
      ORDER BY created_at
    `;
    current.forEach((record: any) => {
      console.log(`   - ID: ${record.id}, Hash: ${record.hash.substring(0, 20)}..., Created: ${new Date(Number(record.created_at)).toISOString()}`);
    });
    
    console.log('\n🧹 Clearing all migration records...');
    await sql`
      DELETE FROM drizzle.__drizzle_migrations
    `;
    
    console.log('📝 Migration table cleared successfully!');
    console.log('\n✨ Next steps:');
    console.log('1. Run: bun db:generate');
    console.log('2. Check generated migration in drizzle/ folder');
    console.log('3. Run: bun db:migrate');
    
  } catch (error) {
    console.error('❌ Error fixing migration state:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixMigrationState();
