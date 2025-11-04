import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function runManualMigration() {
  try {
    console.log('📖 Reading migration file...');
    const migrationSQL = readFileSync(
      join(process.cwd(), 'drizzle', 'manual_tripay_migration.sql'),
      'utf-8'
    );
    
    console.log('🚀 Running Tripay migration...\n');
    
    // Split by semicolons but keep DO blocks together
    const statements = migrationSQL
      .split(/;(?=\s*(?:DO|ALTER|CREATE|DROP|--|\$\$))/g)
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        try {
          await sql.unsafe(trimmed);
          console.log('✅', trimmed.substring(0, 80).replace(/\n/g, ' ') + '...');
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.message?.includes('already exists')) {
            console.log('⏭️  Skipped:', trimmed.substring(0, 60).replace(/\n/g, ' ') + '... (already exists)');
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Checking purchases table structure...');
    
    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'purchases'
      ORDER BY ordinal_position
    `;
    
    console.log('\n✨ Purchases table columns:');
    columns.forEach((col: any) => {
      const type = col.data_type + (col.character_maximum_length ? `(${col.character_maximum_length})` : '');
      console.log(`   - ${col.column_name}: ${type}`);
    });
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

runManualMigration();
