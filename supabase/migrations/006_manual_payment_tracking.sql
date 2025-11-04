-- Add manual payment tracking columns to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'automatic' CHECK (payment_type IN ('manual', 'automatic')),
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS manual_payment_method_id UUID REFERENCES manual_payment_methods(id),
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Create index for manual payment method
CREATE INDEX IF NOT EXISTS idx_purchases_manual_method ON purchases(manual_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_type ON purchases(payment_type);
CREATE INDEX IF NOT EXISTS idx_purchases_verified_by ON purchases(verified_by);

-- Update existing purchases to be 'automatic' type
UPDATE purchases SET payment_type = 'automatic' WHERE payment_type IS NULL;
