import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { purchases, photos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { paymentService } from "@/services/payment.service";
import { tripayService } from "@/services/tripay.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await params;

    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.transactionId, transactionId))
      .limit(1);

    if (!purchase || purchase.buyerId !== user.id) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    if (purchase.paymentType !== "automatic" || !purchase.paymentReference) {
      return NextResponse.json({
        success: true,
        purchase,
        message: "No Tripay sync required",
      });
    }

    const transaction = await tripayService.getTransactionDetail(
      purchase.paymentReference
    );

    const updated = await paymentService.updatePurchaseFromTripay(transaction);

    if (updated.paymentStatus !== "paid") {
      await db
        .update(photos)
        .set({ sold: false })
        .where(eq(photos.id, updated.photoId));
    }

    return NextResponse.json({
      success: true,
      purchase: updated,
    });
  } catch (error) {
    console.error("[Purchase Sync] error:", error);
    let message = "Failed to refresh purchase status";

    if (error instanceof Error) {
      const lower = error.message.toLowerCase();
      if (lower.includes("unauthorized ip") || lower.includes("whitelist ip")) {
        message =
          "Tripay menolak IP server ini. Mohon hubungi administrator untuk menambahkan IP backend ke whitelist atau lanjutkan dengan pembayaran manual.";
      } else if (lower.includes("cloudflare")) {
        message =
          "Tripay tidak dapat dihubungi karena pembatasan Cloudflare. Silakan coba lagi beberapa saat atau gunakan pembayaran manual.";
      } else {
        message = error.message;
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

