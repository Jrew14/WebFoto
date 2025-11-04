import { db } from "../src/db/index";
import { sql } from "drizzle-orm";

async function checkManualPaymentTable() {
  try {
    console.log("Checking if manual_payment_methods table exists...");
    
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'manual_payment_methods'
      );
    `);

    console.log("Table exists:", result);

    // Try to count rows
    const count = await db.execute(sql`
      SELECT COUNT(*) FROM manual_payment_methods;
    `);

    console.log("Row count:", count);

  } catch (error) {
    console.error("Error:", error);
  }
}

checkManualPaymentTable();
