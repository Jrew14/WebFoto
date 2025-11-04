-- Add Xendit payment fields to purchases table
ALTER TABLE purchases 
  ADD COLUMN IF NOT EXISTS xendit_invoice_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS xendit_invoice_url TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Update payment_status enum to include 'paid' and 'expired'
ALTER TABLE purchases 
  DROP CONSTRAINT IF EXISTS purchases_payment_status_check;

ALTER TABLE purchases
  ADD CONSTRAINT purchases_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'expired', 'failed'));

-- Create index for xendit_invoice_id
CREATE INDEX IF NOT EXISTS idx_purchases_xendit_invoice ON purchases(xendit_invoice_id);

-- Update existing records status from 'success' to 'paid' if any
UPDATE purchases SET payment_status = 'paid' WHERE payment_status = 'success';
