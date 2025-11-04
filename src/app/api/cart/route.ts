/**
 * Cart API - GET (Get cart contents)
 * GET /api/cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { cartService } from '@/services';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get cart
    const cart = await cartService.getCart(user.id);

    return NextResponse.json(cart);
  } catch (error) {
    console.error('[Cart API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get cart' },
      { status: 500 }
    );
  }
}

/**
 * Cart API - POST (Add item to cart)
 * POST /api/cart
 * Body: { photoId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    // Add to cart
    await cartService.addToCart(user.id, photoId);

    // Get updated cart count
    const count = await cartService.getCartCount(user.id);

    return NextResponse.json({ 
      message: 'Added to cart',
      cartCount: count
    });
  } catch (error) {
    console.error('[Cart API] Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already in cart')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes('already sold')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

/**
 * Cart API - DELETE (Clear entire cart)
 * DELETE /api/cart
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear cart
    await cartService.clearCart(user.id);

    return NextResponse.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('[Cart API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
