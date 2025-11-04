import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function checkPurchasesTable() {
  try {
    console.log('📊 Current purchases table structure:\n');
    
    const columns = await sql`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'purchases'
      ORDER BY ordinal_position
    `;
    
    columns.forEach((col: any) => {
      const type = col.data_type + (col.character_maximum_length ? `(${col.character_maximum_length})` : '');
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`   ${col.column_name.padEnd(25)} ${type.padEnd(30)} ${nullable}${defaultVal}`);
    });
    
    console.log('\n🔍 Checking for Tripay-specific columns:');
    const tripayColumns = ['total_amount', 'payment_reference', 'payment_checkout_url', 'payment_code', 'payment_note'];
    
    for (const colName of tripayColumns) {
      const exists = columns.find((c: any) => c.column_name === colName);
      console.log(`   ${exists ? '✅' : '❌'} ${colName}`);
    }
    
    console.log('\n🔍 Checking for old Xendit columns:');
    const xenditColumns = ['xendit_invoice_id', 'xendit_invoice_url'];
    
    for (const colName of xenditColumns) {
      const exists = columns.find((c: any) => c.column_name === colName);
      console.log(`   ${exists ? '⚠️  STILL EXISTS' : '✅ Removed'} ${colName}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

checkPurchasesTable();
