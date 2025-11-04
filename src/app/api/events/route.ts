/**
 * Events API - GET (List all events)
 * GET /api/events
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const eventsList = await db
      .select({
        id: events.id,
        name: events.name,
        eventDate: events.eventDate,
      })
      .from(events)
      .orderBy(desc(events.eventDate));

    return NextResponse.json({
      success: true,
      events: eventsList,
    });
  } catch (error) {
    console.error('[Events API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
