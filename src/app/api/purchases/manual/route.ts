import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { purchases, photos, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { photoId, manualPaymentMethodId } = body;

    if (!photoId || !manualPaymentMethodId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get photo details
    const [photo] = await db
      .select()
      .from(photos)
      .where(eq(photos.id, photoId))
      .limit(1);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.sold) {
      return NextResponse.json(
        { error: "Photo already sold" },
        { status: 400 }
      );
    }

    // Check if user already purchased this photo
    const existingPurchases = await db
      .select()
      .from(purchases)
      .where(eq(purchases.buyerId, user.id))
      .limit(100);
    
    const existingPurchase = existingPurchases.find(p => p.photoId === photoId);

    if (existingPurchase) {
      return NextResponse.json(
        { error: "You have already purchased this photo" },
        { status: 400 }
      );
    }

    // Get buyer profile for name and email
    const [buyer] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    // Create manual payment purchase
    const transactionId = `MANUAL-${Date.now()}-${nanoid(8)}`;
    
    // Set expiry to 24 hours from now for manual payments
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const [purchase] = await db
      .insert(purchases)
      .values({
        buyerId: user.id,
        photoId: photoId,
        amount: photo.price,
        totalAmount: photo.price, // TODO: Calculate with fees
        paymentType: "manual",
        paymentMethod: "manual_transfer",
        manualPaymentMethodId: manualPaymentMethodId,
        paymentStatus: "pending",
        transactionId: transactionId,
        expiresAt: expiresAt,
      })
      .returning();

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        transactionId: purchase.transactionId,
        amount: purchase.amount,
        totalAmount: purchase.totalAmount,
        status: purchase.paymentStatus,
        expiresAt: purchase.expiresAt,
      },
    });
  } catch (error) {
    console.error("Manual purchase creation error:", error);
    return NextResponse.json(
      { error: "Failed to create manual purchase" },
      { status: 500 }
    );
  }
}
