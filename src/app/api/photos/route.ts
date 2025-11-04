/**
 * Photos API - GET (List all available photos)
 * GET /api/photos
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { photos, events, profiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const photosList = await db
      .select({
        id: photos.id,
        name: photos.name,
        previewUrl: photos.previewUrl,
        price: photos.price,
        sold: photos.sold,
        eventId: photos.eventId,
        createdAt: photos.createdAt,
        event: {
          id: events.id,
          name: events.name,
          eventDate: events.eventDate,
        },
        photographer: {
          id: profiles.id,
          fullName: profiles.fullName,
        },
      })
      .from(photos)
      .innerJoin(events, eq(photos.eventId, events.id))
      .innerJoin(profiles, eq(photos.photographerId, profiles.id))
      .orderBy(desc(photos.createdAt));

    return NextResponse.json({
      success: true,
      photos: photosList,
    });
  } catch (error) {
    console.error('[Photos API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
