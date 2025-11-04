-- Tripay migration: replace Xendit-specific columns

ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS total_amount INTEGER,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_checkout_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_code TEXT,
  ADD COLUMN IF NOT EXISTS payment_note TEXT;

-- Ensure uniqueness and indexing for Tripay reference
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_payment_reference ON purchases(payment_reference);

-- Remove legacy Xendit columns and index
DROP INDEX IF EXISTS idx_purchases_xendit_invoice;

ALTER TABLE purchases
  DROP COLUMN IF EXISTS xendit_invoice_id,
  DROP COLUMN IF EXISTS xendit_invoice_url;
