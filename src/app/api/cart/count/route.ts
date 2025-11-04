/**
 * Cart Count API
 * GET /api/cart/count
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
      return NextResponse.json({ count: 0 });
    }

    const count = await cartService.getCartCount(user.id);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('[Cart Count API] Error:', error);
    return NextResponse.json({ count: 0 });
  }
}
