import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { purchases, photos, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all purchases for this user with photo and event details
    const userPurchases = await db
      .select({
        id: purchases.id,
        transactionId: purchases.transactionId,
        amount: purchases.amount,
        totalAmount: purchases.totalAmount,
        paymentType: purchases.paymentType,
        paymentStatus: purchases.paymentStatus,
        paymentMethod: purchases.paymentMethod,
        purchasedAt: purchases.purchasedAt,
        paidAt: purchases.paidAt,
        expiresAt: purchases.expiresAt,
        photo: {
          id: photos.id,
          name: photos.name,
          previewUrl: photos.previewUrl,
          fullUrl: photos.fullUrl,
        },
        event: {
          id: events.id,
          name: events.name,
          eventDate: events.eventDate,
        },
      })
      .from(purchases)
      .leftJoin(photos, eq(purchases.photoId, photos.id))
      .leftJoin(events, eq(photos.eventId, events.id))
      .where(eq(purchases.buyerId, user.id))
      .orderBy(desc(purchases.purchasedAt));

    const formattedPurchases = userPurchases.map((p) => ({
      id: p.id,
      transactionId: p.transactionId,
      amount: p.amount,
      totalAmount: p.totalAmount,
      paymentType: p.paymentType || "automatic",
      paymentStatus: p.paymentStatus,
      paymentMethod: p.paymentMethod,
      purchasedAt: p.purchasedAt,
      paidAt: p.paidAt,
      expiresAt: p.expiresAt,
      photo: p.photo
        ? {
            id: p.photo.id,
            name: p.photo.name,
            previewUrl: p.photo.previewUrl,
            fullUrl: p.photo.fullUrl,
            event: p.event
              ? {
                  name: p.event.name,
                  eventDate: p.event.eventDate,
                }
              : null,
          }
        : null,
    })).filter((p) => p.photo !== null);

    return NextResponse.json({
      success: true,
      purchases: formattedPurchases,
    });
  } catch (error) {
    console.error("Failed to fetch user purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
