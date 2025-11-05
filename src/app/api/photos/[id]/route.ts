import { NextResponse } from "next/server";
import { db } from "@/db";
import { photos, events, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [photo] = await db
      .select({
        id: photos.id,
        name: photos.name,
        price: photos.price,
        previewUrl: photos.previewUrl,
        fullUrl: photos.fullUrl,
        watermarkUrl: photos.watermarkUrl,
        sold: photos.sold,
        event: {
          id: events.id,
          name: events.name,
          eventDate: events.eventDate,
        },
        photographer: {
          id: profiles.id,
          fullName: profiles.fullName,
          email: profiles.email,
        },
      })
      .from(photos)
      .leftJoin(events, eq(photos.eventId, events.id))
      .leftJoin(profiles, eq(photos.photographerId, profiles.id))
      .where(eq(photos.id, id))
      .limit(1);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("[Photo API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}
