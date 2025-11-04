-- Add Tripay fields to existing purchases table
-- This is a manual migration since the table already exists

-- Check if columns exist before adding them
DO $$ 
BEGIN
  -- Add total_amount if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE purchases ADD COLUMN total_amount INTEGER;
  END IF;

  -- Add payment_method if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE purchases ADD COLUMN payment_method TEXT;
  END IF;

  -- Add payment_reference if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE purchases ADD COLUMN payment_reference TEXT;
  END IF;

  -- Add payment_checkout_url if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' AND column_name = 'payment_checkout_url'
  ) THEN
    ALTER TABLE purchases ADD COLUMN payment_checkout_url TEXT;
  END IF;

  -- Add payment_code if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' AND column_name = 'payment_code'
  ) THEN
    ALTER TABLE purchases ADD COLUMN payment_code TEXT;
  END IF;

  -- Add payment_note if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' AND column_name = 'payment_note'
  ) THEN
    ALTER TABLE purchases ADD COLUMN payment_note TEXT;
  END IF;
END $$;

-- Add unique constraint on payment_reference if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'purchases_payment_reference_unique'
  ) THEN
    ALTER TABLE purchases ADD CONSTRAINT purchases_payment_reference_unique UNIQUE (payment_reference);
  END IF;
END $$;

-- Add index on payment_reference if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_purchases_payment_reference'
  ) THEN
    CREATE INDEX idx_purchases_payment_reference ON purchases USING btree (payment_reference);
  END IF;
END $$;

-- Remove old Xendit columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' AND column_name = 'xendit_invoice_id'
  ) THEN
    ALTER TABLE purchases DROP COLUMN xendit_invoice_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' AND column_name = 'xendit_invoice_url'
  ) THEN
    ALTER TABLE purchases DROP COLUMN xendit_invoice_url;
  END IF;
END $$;
