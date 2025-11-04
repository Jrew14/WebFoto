/**
 * Cart Item API - DELETE (Remove single item)
 * DELETE /api/cart/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { cartService } from '@/services';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Remove from cart
    await cartService.removeFromCart(user.id, id);

    // Get updated cart count
    const count = await cartService.getCartCount(user.id);

    return NextResponse.json({ 
      message: 'Removed from cart',
      cartCount: count
    });
  } catch (error) {
    console.error('[Cart Item API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
