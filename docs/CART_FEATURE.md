# Shopping Cart Feature

## Overview
Fitur shopping cart memungkinkan user untuk menambahkan multiple photos ke dalam keranjang sebelum melakukan checkout. Ini meningkatkan user experience dengan memungkinkan pembelian bulk.

## Architecture

### Database Schema
**Table: `cart_items`**
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_cart_user_photo UNIQUE (user_id, photo_id)
);
```

**Key Features:**
- One cart item per photo per user (enforced by unique constraint)
- Cascade delete when user or photo is deleted
- Indexed for performance

### Service Layer
**File:** `src/services/cart.service.ts`

**Methods:**
- `getCart(userId)` - Get full cart with photo details and pricing
- `getCartCount(userId)` - Get number of items in cart
- `addToCart(userId, photoId)` - Add photo to cart with validations
- `removeFromCart(userId, cartItemId)` - Remove single item
- `clearCart(userId)` - Empty entire cart
- `isInCart(userId, photoId)` - Check if photo is in cart
- `validateCart(userId)` - Validate all items before checkout

**Business Logic:**
- Prevents adding sold photos
- Prevents duplicate items
- Calculates platform fee (5%)
- Validates availability before checkout

### API Endpoints

**GET `/api/cart`**
- Returns: Full cart with items, pricing, and totals
- Auth: Required

**POST `/api/cart`**
- Body: `{ photoId: string }`
- Returns: `{ message, cartCount }`
- Validations: Photo exists, not sold, not already in cart
- Auth: Required

**DELETE `/api/cart`**
- Clears entire cart
- Auth: Required

**DELETE `/api/cart/[id]`**
- Removes single item
- Returns: Updated cart count
- Auth: Required

**GET `/api/cart/count`**
- Returns: `{ count: number }`
- Auth: Optional (returns 0 if not authenticated)

### UI Components

**CartSheet Component**
**File:** `src/components/public/cart-sheet.tsx`

**Features:**
- Slide-out sheet from right side
- Badge notification showing item count
- Photo thumbnails with details
- Remove individual items
- Clear entire cart
- Price breakdown (subtotal, platform fee, total)
- Checkout button
- Empty state

**Usage:**
```tsx
import { CartSheet } from "@/components/public/cart-sheet";

<CartSheet onCheckout={() => router.push("/checkout")} />
```

## User Flow

### Adding to Cart
1. User browses gallery
2. Clicks "Add to Cart" button on photo
3. Photo is validated (exists, not sold, not duplicate)
4. Item is added to cart
5. Cart count badge updates
6. Success notification shown

### Viewing Cart
1. User clicks cart icon with badge
2. Sheet slides in from right
3. Shows all items with:
   - Photo preview
   - Photo name
   - Event name
   - Photographer name
   - Price
   - Remove button

### Cart Summary
- **Subtotal:** Sum of all photo prices
- **Platform Fee:** 5% of subtotal
- **Total:** Subtotal + Platform Fee

### Checkout
1. User reviews cart
2. Clicks "Proceed to Checkout"
3. Cart is validated (all photos still available)
4. Redirects to checkout page with cart items
5. After successful payment, cart is cleared

## Security

### RLS Policies
```sql
-- Users can only view their own cart items
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only add to their own cart
CREATE POLICY "Users can add items to their own cart"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete from their own cart
CREATE POLICY "Users can delete items from their own cart"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can view all carts
CREATE POLICY "Admin can view all cart items"
  ON cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## Database Migration

**File:** `supabase/migrations/003_add_cart_items.sql`

**To apply:**
1. Open Supabase SQL Editor
2. Copy contents of migration file
3. Execute SQL
4. Verify table and policies created

## Integration Points

### Gallery Page
```tsx
// Add to cart button for each photo
<Button
  onClick={() => addToCart(photo.id)}
  disabled={photo.sold || isInCart(photo.id)}
>
  {isInCart(photo.id) ? "In Cart" : "Add to Cart"}
</Button>
```

### Checkout Flow
```tsx
// Get cart items for checkout
const cart = await cartService.getCart(userId);

// Validate before payment
const { valid, errors } = await cartService.validateCart(userId);
if (!valid) {
  return { errors };
}

// Create bulk purchase
const purchases = await Promise.all(
  cart.items.map(item => 
    createPurchase(userId, item.photoId, item.photoPrice)
  )
);

// Clear cart after success
await cartService.clearCart(userId);
```

## Error Handling

### Common Errors
1. **Photo already in cart** (409 Conflict)
   - Message: "Photo is already in cart"
   - Action: Show in-cart state

2. **Photo not found** (404 Not Found)
   - Message: "Photo not found"
   - Action: Remove from UI

3. **Photo already sold** (400 Bad Request)
   - Message: "Photo is already sold"
   - Action: Remove from cart, update UI

4. **Unauthorized** (401)
   - Message: "Please log in to use cart"
   - Action: Redirect to login

## Performance Considerations

1. **Cart Count Caching**
   - Store count in React state
   - Update on add/remove
   - Refresh on page load

2. **Debounced Updates**
   - Batch UI updates
   - Prevent excessive API calls

3. **Optimistic UI**
   - Update UI immediately
   - Rollback on error

4. **Indexed Queries**
   - All cart queries use indexed columns
   - Fast lookups by user_id and photo_id

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic cart functionality
- ✅ Add/remove items
- ✅ View cart with details
- ✅ Price calculation

### Phase 2 (Planned)
- [ ] Persistent cart across devices
- [ ] Save for later functionality
- [ ] Cart expiration (auto-remove old items)
- [ ] Cart sharing (unique links)

### Phase 3 (Future)
- [ ] Bulk discount logic
- [ ] Coupon/promo code support
- [ ] Wishlist integration
- [ ] Cart recovery emails

## Testing Checklist

### Manual Testing
- [ ] Add photo to cart
- [ ] Add multiple photos
- [ ] View cart
- [ ] Remove single item
- [ ] Clear entire cart
- [ ] Try adding sold photo (should fail)
- [ ] Try adding duplicate (should fail)
- [ ] Cart count updates correctly
- [ ] Checkout with cart items
- [ ] Cart clears after successful purchase

### Edge Cases
- [ ] Add to cart while not logged in
- [ ] Photo gets sold while in cart
- [ ] Photo gets deleted while in cart
- [ ] User has empty cart
- [ ] User has 50+ items
- [ ] Network error during add
- [ ] Concurrent add operations

## Troubleshooting

### Cart count not updating
- Check cart state management
- Verify API responses include cartCount
- Clear browser cache

### Photos not showing in cart
- Verify cart_items table exists
- Check RLS policies
- Verify photo relations in schema

### Checkout not working
- Verify cart validation passes
- Check payment gateway configuration
- Verify bulk purchase logic

## Related Documentation
- [PRD](./prd.md) - Product requirements
- [Plan](./plan.md) - Delivery plan
- [Purchase Flow](./ADMIN_USER_SEPARATION_SUMMARY.md) - Payment system
- [Gallery](./GALLERY_SUMMARY.md) - Photo browsing
