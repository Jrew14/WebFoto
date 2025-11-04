import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { purchases, profiles, photos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { tripayService } from "@/services/tripay.service";
import { fonnteService } from "@/services/fonnte.service";

/**
 * Tripay Webhook Handler
 * Called by Tripay when payment status changes
 * This is different from callback/return URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[Tripay Webhook] Received:", body);

    // Verify webhook signature
    const isValid = tripayService.verifyCallbackSignature({
      reference: body.reference,
      merchantRef: body.merchant_ref,
      status: body.status,
      totalAmount: body.total_amount,
      signature: body.signature,
    });

    if (!isValid) {
      console.error("[Tripay Webhook] Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    // Map Tripay status to our status
    const paymentStatus = tripayService.mapTripayStatus(body.status);

    // Find purchase by transaction ID (merchant_ref)
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.transactionId, body.merchant_ref))
      .limit(1);

    if (!purchase) {
      console.error("[Tripay Webhook] Purchase not found:", body.merchant_ref);
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Update purchase status
    const updateData: any = {
      paymentStatus: paymentStatus,
    };

    if (paymentStatus === "paid") {
      updateData.paidAt = new Date();
    }

    await db
      .update(purchases)
      .set(updateData)
      .where(eq(purchases.id, purchase.id));

    console.log(`[Tripay Webhook] Purchase ${purchase.id} updated to ${paymentStatus}`);

    // Send WhatsApp notification if payment successful
    if (paymentStatus === "paid") {
      // Get buyer and photo details
      const [buyer] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, purchase.buyerId))
        .limit(1);

      const [photo] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, purchase.photoId))
        .limit(1);

      if (buyer?.phone && photo) {
        const formattedPhone = fonnteService.formatPhoneNumber(buyer.phone);
        const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://piksel-jual.vercel.app"}/gallery`;
        
        fonnteService.sendPaymentSuccess({
          customerName: buyer.fullName,
          customerPhone: formattedPhone,
          photoName: photo.name,
          amount: purchase.amount,
          transactionId: purchase.transactionId || body.merchant_ref,
          downloadUrl: downloadUrl,
        }).catch(error => {
          console.error("Failed to send payment success WhatsApp notification:", error);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Tripay Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
