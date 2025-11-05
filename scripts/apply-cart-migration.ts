import postgres from "postgres";

const requiredEnv = process.env.DATABASE_URL;

if (!requiredEnv) {
  console.error("DATABASE_URL is not set. Aborting manual migration.");
  process.exit(1);
}

const sql = postgres(requiredEnv, {
  ssl: "require",
  max: 1,
});

async function main() {
  console.log("Applying manual cart/purchase migration...");

  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

  await sql`
    CREATE TABLE IF NOT EXISTS cart_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS unique_cart_user_photo
    ON cart_items (user_id, photo_id);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_cart_items_user
    ON cart_items (user_id);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_cart_items_photo
    ON cart_items (photo_id);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS purchase_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      purchase_id uuid REFERENCES purchases(id) ON DELETE SET NULL,
      action text NOT NULL,
      note text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_purchase_logs_purchase
    ON purchase_logs (purchase_id);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_purchase_logs_created
    ON purchase_logs (created_at);
  `;

  await sql`
    ALTER TABLE purchases
    ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'automatic';
  `;

  await sql`
    ALTER TABLE purchases
    ADD COLUMN IF NOT EXISTS payment_proof_url text;
  `;

  await sql`
    ALTER TABLE purchases
    ADD COLUMN IF NOT EXISTS manual_payment_method_id uuid REFERENCES manual_payment_methods(id);
  `;

  await sql`
    ALTER TABLE purchases
    ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES profiles(id);
  `;

  await sql`
    ALTER TABLE purchases
    ADD COLUMN IF NOT EXISTS verified_at timestamptz;
  `;

  console.log("Manual migration completed.");
}

main()
  .catch((error) => {
    console.error("Failed to run manual migration:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end({ timeout: 5 });
  });
