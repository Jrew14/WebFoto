import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function checkMigrationsTable() {
  try {
    console.log('🔍 Checking migrations table structure...\n');
    
    // Get table structure
    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Table columns:');
    columns.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
    });
    
    console.log('\n📊 Current migration records:');
    const records = await sql`
      SELECT id, hash, created_at
      FROM drizzle.__drizzle_migrations
      ORDER BY created_at
    `;
    
    if (records.length === 0) {
      console.log('   ⚠️  No records found');
    } else {
      records.forEach((record: any) => {
        console.log(`   - ID: ${record.id}, Hash: ${record.hash}, Created: ${new Date(Number(record.created_at)).toISOString()}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

checkMigrationsTable();
