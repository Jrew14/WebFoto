/**
 * Photo Download API
 * 
 * Provides secure download URLs for purchased photos only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { purchaseService } from '@/services/purchase.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has purchased this photo
    const purchases = await purchaseService.getUserPurchases(user.id);
    const hasPurchased = purchases.some(p => p.photoId === photoId);

    if (!hasPurchased) {
      return NextResponse.json(
        { error: 'You have not purchased this photo' },
        { status: 403 }
      );
    }

    // Get the photo purchase to access fullUrl
    const purchase = purchases.find(p => p.photoId === photoId);
    if (!purchase?.photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Extract the file path from fullUrl
    // Format: https://{project}.supabase.co/storage/v1/object/public/photos/{path}
    const fullUrl = purchase.photo.fullUrl;
    const pathMatch = fullUrl.match(/\/photos\/(.+)$/);
    
    if (!pathMatch) {
      return NextResponse.json(
        { error: 'Invalid photo URL' },
        { status: 500 }
      );
    }

    const filePath = pathMatch[1];

    // Generate a signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('photos')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      console.error('Failed to create signed URL:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    // Return the signed URL
    return NextResponse.json({
      downloadUrl: signedUrlData.signedUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}
