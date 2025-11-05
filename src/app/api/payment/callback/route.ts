import { NextResponse } from "next/server";
import { tripayService } from "@/services/tripay.service";
import { paymentService } from "@/services/payment.service";
import { db } from "@/db";
import { purchases } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Tripay Return URL Callback
 * This endpoint handles user redirect after completing/canceling payment
 * Different from webhook - this is for UX redirect only
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let reference = searchParams.get("reference");
    const merchant_ref = searchParams.get("merchant_ref");

    let transaction = null;

    // Attempt to recover reference from database if missing
    if (!reference && merchant_ref) {
      const [purchase] = await db
        .select({
          id: purchases.id,
          paymentReference: purchases.paymentReference,
          paymentStatus: purchases.paymentStatus,
        })
        .from(purchases)
        .where(eq(purchases.transactionId, merchant_ref))
        .limit(1);

      if (purchase?.paymentReference) {
        reference = purchase.paymentReference;
      }

      // If already marked paid in DB but no reference, redirect to purchase log
      if (!reference && purchase?.paymentStatus === "paid") {
        return NextResponse.redirect(
          new URL(`/user/purchases?highlight=${merchant_ref}`, request.url)
        );
      }
    }

    // Fetch latest transaction status from Tripay
    if (reference) {
      transaction = await tripayService.getTransactionDetail(reference);
    } else if (merchant_ref) {
      transaction = await tripayService.getTransactionDetailByMerchantRef(
        merchant_ref
      );
      reference = transaction.reference;
    }

    if (!transaction) {
      return NextResponse.redirect(
        new URL("/payment/failed?error=missing_reference", request.url)
      );
    }

    // Update purchase status based on latest transaction info
    await paymentService.updatePurchaseFromTripay(transaction);

    const normalizedStatus = tripayService.mapTripayStatus(transaction.status);

    // Redirect based on payment status
    if (normalizedStatus === "paid") {
      return NextResponse.redirect(
        new URL(
          `/user/purchases?highlight=${merchant_ref || transaction.merchant_ref}`,
          request.url
        )
      );
    } else if (normalizedStatus === "expired" || normalizedStatus === "failed") {
      return NextResponse.redirect(
        new URL(
          `/payment/failed?reference=${reference}&merchant_ref=${
            merchant_ref || transaction.merchant_ref
          }`,
          request.url
        )
      );
    } else {
      return NextResponse.redirect(
        new URL(
          `/payment/pending?reference=${reference}&merchant_ref=${
            merchant_ref || transaction.merchant_ref
          }`,
          request.url
        )
      );
    }
  } catch (error) {
    console.error("Tripay callback error:", error);
    return NextResponse.redirect(
      new URL("/payment/failed?error=callback_failed", request.url)
    );
  }
}
