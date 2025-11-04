import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { paymentService } from '@/services/payment.service';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { photoId, paymentMethod } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Create purchase and get Tripay checkout details
    const { purchase, checkoutUrl, payCode, reference } = await paymentService.createPurchase({
      buyerId: user.id,
      photoId: photoId,
      buyerEmail: user.email!,
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      purchase,
      checkoutUrl,
      payCode,
      reference,
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create purchase';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
