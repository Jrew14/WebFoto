import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function addTripayColumns() {
  try {
    console.log('🚀 Adding Tripay columns to purchases table...\n');
    
    // Add total_amount
    console.log('Adding total_amount...');
    await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS total_amount INTEGER`;
    console.log('✅ total_amount added');
    
    // Add payment_reference
    console.log('Adding payment_reference...');
    await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_reference TEXT`;
    console.log('✅ payment_reference added');
    
    // Add payment_checkout_url
    console.log('Adding payment_checkout_url...');
    await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_checkout_url TEXT`;
    console.log('✅ payment_checkout_url added');
    
    // Add payment_code
    console.log('Adding payment_code...');
    await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_code TEXT`;
    console.log('✅ payment_code added');
    
    // Add payment_note
    console.log('Adding payment_note...');
    await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_note TEXT`;
    console.log('✅ payment_note added');
    
    // Add paid_at
    console.log('Adding paid_at...');
    await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE`;
    console.log('✅ paid_at added');
    
    // Add expires_at
    console.log('Adding expires_at...');
    await sql`ALTER TABLE purchases ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE`;
    console.log('✅ expires_at added');
    
    // Add unique constraint on payment_reference
    console.log('\nAdding unique constraint on payment_reference...');
    try {
      await sql`ALTER TABLE purchases ADD CONSTRAINT purchases_payment_reference_unique UNIQUE (payment_reference)`;
      console.log('✅ Unique constraint added');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        console.log('⏭️  Constraint already exists');
      } else {
        throw e;
      }
    }
    
    // Add index on payment_reference
    console.log('Adding index on payment_reference...');
    try {
      await sql`CREATE INDEX idx_purchases_payment_reference ON purchases (payment_reference)`;
      console.log('✅ Index added');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        console.log('⏭️  Index already exists');
      } else {
        throw e;
      }
    }
    
    console.log('\n🎉 All Tripay columns added successfully!');
    
    // Show final structure
    console.log('\n📊 Final purchases table structure:');
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'purchases'
      ORDER BY ordinal_position
    `;
    columns.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

addTripayColumns();
