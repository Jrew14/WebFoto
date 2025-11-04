-- Create manual_payment_methods table
CREATE TABLE IF NOT EXISTS manual_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (type IN ('bank_transfer', 'e_wallet', 'other')),
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  min_amount INTEGER NOT NULL DEFAULT 10000,
  max_amount INTEGER NOT NULL DEFAULT 20000000,
  fee INTEGER NOT NULL DEFAULT 0,
  fee_percentage INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_manual_payment_active ON manual_payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_manual_payment_sort ON manual_payment_methods(sort_order);

-- Enable RLS
ALTER TABLE manual_payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active payment methods
CREATE POLICY "Anyone can view active payment methods"
  ON manual_payment_methods
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage payment methods"
  ON manual_payment_methods
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default payment methods
INSERT INTO manual_payment_methods (name, type, account_number, account_name, min_amount, max_amount, fee, sort_order, is_active) VALUES
('BCA', 'bank_transfer', '1482579307', 'THIRAFI THARIQ AL IDRIS', 1000, 20000000, 0, 1, false),
('BNI', 'bank_transfer', 'xxxx', 'THIRAFI THARIQ AL IDRIS', 10000, 20000000, 0, 2, false),
('BRI', 'bank_transfer', 'xxxx', 'THIRAFI THARIQ AL IDRIS', 10000, 20000000, 0, 3, false),
('MANDIRI', 'bank_transfer', 'xxxx', 'THIRAFI THARIQ AL IDRIS', 10000, 20000000, 0, 4, false),
('DANA', 'e_wallet', '081222327635', 'FAZRI LUKMAN NURRO', 10000, 4000000, 0, 5, true),
('GOPAY', 'e_wallet', '085187249851', 'JualSosmed', 10000, 4000000, 0, 6, true),
('OVO', 'e_wallet', '085187249851', 'JualSosmed', 10000, 4000000, 0, 7, true),
('Link Aja', 'e_wallet', 'xxxx', 'THIRAFI THARIQ AL IDRIS', 10000, 4000000, 0, 8, false),
('QRIS', 'other', 'QRIS', '', 10000, 4000000, 0, 9, false)
ON CONFLICT DO NOTHING;
