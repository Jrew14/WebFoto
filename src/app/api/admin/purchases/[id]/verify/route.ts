import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { purchases, profiles, photos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fonnteService } from "@/services/fonnte.service";
import { purchaseLogService } from "@/services/purchase-log.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile || profile.length === 0 || profile[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Get the purchase
    const purchase = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, id))
      .limit(1);

    if (!purchase || purchase.length === 0) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Only allow verifying pending manual payments
    if (purchase[0].paymentStatus !== "pending" || purchase[0].paymentType !== "manual") {
      return NextResponse.json(
        { error: "Can only verify pending manual payments" },
        { status: 400 }
      );
    }

    // Update purchase status
    const newStatus = action === "approve" ? "paid" : "failed";
    const now = new Date();

    await db
      .update(purchases)
      .set({
        paymentStatus: newStatus,
        paidAt: action === "approve" ? now : null,
        verifiedBy: user.id,
        verifiedAt: now,
      })
      .where(eq(purchases.id, id));

    if (action === "approve") {
      await db
        .update(photos)
        .set({ sold: true })
        .where(eq(photos.id, purchase[0].photoId));
    } else {
      await db
        .update(photos)
        .set({ sold: false })
        .where(eq(photos.id, purchase[0].photoId));
    }

    await purchaseLogService.log({
      purchaseId: purchase[0].id,
      action: action === "approve" ? "manual_approved" : "manual_rejected",
      note:
        action === "approve"
          ? `Pembayaran manual disetujui oleh ${profile[0].fullName}.`
          : `Pembayaran manual ditolak oleh ${profile[0].fullName}.`,
    });

    // Send WhatsApp notification if approved
    if (action === "approve") {
      // Get buyer and photo details
      const [buyer] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, purchase[0].buyerId))
        .limit(1);

      const [photo] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, purchase[0].photoId))
        .limit(1);

      if (buyer?.phone && photo) {
        const formattedPhone = fonnteService.formatPhoneNumber(buyer.phone);
        const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://piksel-jual.vercel.app"}/gallery`;
        
        fonnteService.sendPaymentApproved({
          customerName: buyer.fullName,
          customerPhone: formattedPhone,
          photoName: photo.name,
          amount: purchase[0].amount,
          transactionId: purchase[0].transactionId || `MANUAL-${id.substring(0, 8)}`,
          downloadUrl: downloadUrl,
        }).catch(error => {
          console.error("Failed to send approval WhatsApp notification:", error);
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Purchase ${action === "approve" ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    console.error("Failed to verify purchase:", error);
    return NextResponse.json(
      { error: "Failed to verify purchase" },
      { status: 500 }
    );
  }
}
