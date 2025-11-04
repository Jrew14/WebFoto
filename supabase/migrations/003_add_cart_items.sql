-- =====================================================
-- CART ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: user can only add each photo once to cart
  CONSTRAINT unique_cart_user_photo UNIQUE (user_id, photo_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_photo ON cart_items(photo_id);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cart_items
-- Users can only see their own cart items
CREATE POLICY "Users can view their own cart items"
  ON cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add items to their own cart
CREATE POLICY "Users can add items to their own cart"
  ON cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete items from their own cart
CREATE POLICY "Users can delete items from their own cart"
  ON cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can view all cart items
CREATE POLICY "Admin can view all cart items"
  ON cart_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
