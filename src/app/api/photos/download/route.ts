/**
 * Photo Download API
 * 
 * Provides secure download URLs for purchased photos only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { purchases, photos } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

    // Check if user has purchased this photo with "paid" status
    const purchase = await db
      .select({
        id: purchases.id,
        paymentStatus: purchases.paymentStatus,
        photoId: purchases.photoId,
        photoName: photos.name,
        fullUrl: photos.fullUrl,
      })
      .from(purchases)
      .leftJoin(photos, eq(purchases.photoId, photos.id))
      .where(
        and(
          eq(purchases.buyerId, user.id),
          eq(purchases.photoId, photoId),
          eq(purchases.paymentStatus, "paid")
        )
      )
      .limit(1);

    if (!purchase || purchase.length === 0) {
      return NextResponse.json(
        { error: 'You have not purchased this photo or payment is pending' },
        { status: 403 }
      );
    }

    const fullUrl = purchase[0].fullUrl;
    const photoName = purchase[0].photoName || 'photo';
    
    if (!fullUrl) {
      return NextResponse.json(
        { error: 'Photo URL not found' },
        { status: 404 }
      );
    }

    // Extract the file path from fullUrl
    // Format: https://{project}.supabase.co/storage/v1/object/public/photos/{path}
    const pathMatch = fullUrl.match(/\/photos\/(.+)$/);
    
    if (!pathMatch) {
      return NextResponse.json(
        { error: 'Invalid photo URL' },
        { status: 500 }
      );
    }

    const filePath = pathMatch[1];

    // Download the actual file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('photos')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('Failed to download file:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download photo' },
        { status: 500 }
      );
    }

    // Get file extension from path
    const fileExt = filePath.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    const contentType = mimeTypes[fileExt] || 'image/jpeg';

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();

    // Return the file as a download
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${photoName}.${fileExt}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}
